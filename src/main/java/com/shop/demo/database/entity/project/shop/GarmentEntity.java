package com.shop.demo.database.entity.project.shop;

import jakarta.persistence.*;

@Entity
@Table(name = "garments")
public class GarmentEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Column(name = "garment_type")
    private String garmentType;   // mens | womens | kids | gym | couple | seasonal

    @Column(name = "category_id")
    private Long categoryId;      // FK → categories.id (nullable)

    @Column(name = "base_price")
    private Integer basePrice;

    private boolean active = true;

    private boolean featured = false;  // default off — admin enables per garment

    // kept for legacy technical controller compatibility
    private String type;

    @Column(name = "base_color")
    private String baseColor;

    private Integer gsm;

    @Column(name = "fabric_description")
    private String fabricDescription;

    @Column(name = "sizes", length = 100)
    private String sizes = "S,M,L,XL,XXL";

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "cost_price")
    private Integer costPrice = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGarmentType() { return garmentType; }
    public void setGarmentType(String garmentType) { this.garmentType = garmentType; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Integer getBasePrice() { return basePrice; }
    public void setBasePrice(Integer basePrice) { this.basePrice = basePrice; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getBaseColor() { return baseColor; }
    public void setBaseColor(String baseColor) { this.baseColor = baseColor; }
    public Integer getGsm() { return gsm; }
    public void setGsm(Integer gsm) { this.gsm = gsm; }
    public String getFabricDescription() { return fabricDescription; }
    public void setFabricDescription(String fabricDescription) { this.fabricDescription = fabricDescription; }
    public String getSizes() { return sizes; }
    public void setSizes(String sizes) { this.sizes = sizes; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public Integer getCostPrice() { return costPrice; }
    public void setCostPrice(Integer costPrice) { this.costPrice = costPrice; }
}
