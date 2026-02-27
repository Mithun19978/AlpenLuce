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
    private String garmentType;

    @Column(name = "category")
    private String category;   // mens | womens | kids

    @Column(name = "base_price")
    private Integer basePrice;

    private boolean active = true;

    private boolean featured = true;  // controls visibility on home page

    // kept for legacy controller compatibility
    private String type;

    @Column(name = "base_color")
    private String baseColor;

    private Integer gsm;

    @Column(name = "fabric_description")
    private String fabricDescription;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGarmentType() { return garmentType; }
    public void setGarmentType(String garmentType) { this.garmentType = garmentType; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
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
}
