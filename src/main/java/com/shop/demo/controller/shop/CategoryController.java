package com.shop.demo.controller.shop;

import com.shop.demo.database.entity.project.shop.CategoryEntity;
import com.shop.demo.database.repository.projectRepository.shop.CategoryRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /** Public — authenticated users see active categories (used by shop page) */
    @GetMapping("/server/categories")
    public List<CategoryEntity> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDepthAscDisplayOrderAsc();
    }

    /** Admin/Tech — all categories including hidden */
    @GetMapping("/server/admin/categories")
    public List<CategoryEntity> getAllCategories() {
        return categoryRepository.findAllByOrderByDepthAscDisplayOrderAsc();
    }

    /** Admin/Tech — toggle a category's active state */
    @PatchMapping("/server/admin/categories/{id}/active")
    public ResponseEntity<Map<String, String>> setActive(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return categoryRepository.findById(id).map(cat -> {
            cat.setActive(active);
            categoryRepository.save(cat);
            return ResponseEntity.ok(Map.of("message", "Category updated"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    /** Admin/Tech — rename a category */
    @PatchMapping("/server/admin/categories/{id}/rename")
    public ResponseEntity<Map<String, String>> renameCategory(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newName = body.get("name");
        if (newName == null || newName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        }
        return categoryRepository.findById(id).map(cat -> {
            cat.setName(newName.trim());
            categoryRepository.save(cat);
            return ResponseEntity.ok(Map.of("message", "Category renamed"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    /** Admin/Tech — delete a category */
    @DeleteMapping("/server/admin/categories/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).map(cat -> {
            categoryRepository.delete(cat);
            return ResponseEntity.ok(Map.of("message", "Category deleted"));
        }).orElse(ResponseEntity.notFound().<Map<String, String>>build());
    }

    /** Admin/Tech — create a new category */
    @PostMapping("/server/admin/categories")
    public ResponseEntity<CategoryEntity> createCategory(
            @RequestBody CategoryRequest request) {

        CategoryEntity cat = new CategoryEntity();
        cat.setName(request.name);
        cat.setActive(true);

        if (request.parentId != null) {
            cat.setParentId(request.parentId);
            // depth = parent.depth + 1
            categoryRepository.findById(request.parentId).ifPresent(parent ->
                cat.setDepth(parent.getDepth() + 1)
            );
        } else {
            cat.setDepth(0);
        }

        // display_order = current max + 1 at this depth
        cat.setDisplayOrder(0);

        CategoryEntity saved = categoryRepository.save(cat);
        return ResponseEntity.ok(saved);
    }

    public static class CategoryRequest {
        public String name;
        public Long parentId;
    }
}
