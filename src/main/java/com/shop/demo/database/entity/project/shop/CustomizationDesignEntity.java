package com.shop.demo.database.entity.project.shop;

import jakarta.persistence.*;

@Entity
@Table(name = "customization_designs")
public class CustomizationDesignEntity {

    public enum Area { FRONT, BACK, LEFT_SLEEVE, RIGHT_SLEEVE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customization_id", nullable = false)
    private Long customizationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "area", nullable = false)
    private Area area;

    @Column(name = "cloudinary_url", length = 512)
    private String cloudinaryUrl;

    @Column(name = "pos_x")
    private Double posX = 0.0;

    @Column(name = "pos_y")
    private Double posY = 0.0;

    @Column(name = "pos_z")
    private Double posZ = 0.0;

    @Column(name = "scale")
    private Double scale = 1.0;

    @Column(name = "rotation")
    private Double rotation = 0.0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCustomizationId() { return customizationId; }
    public void setCustomizationId(Long customizationId) { this.customizationId = customizationId; }
    public Area getArea() { return area; }
    public void setArea(Area area) { this.area = area; }
    public String getCloudinaryUrl() { return cloudinaryUrl; }
    public void setCloudinaryUrl(String cloudinaryUrl) { this.cloudinaryUrl = cloudinaryUrl; }
    public Double getPosX() { return posX; }
    public void setPosX(Double posX) { this.posX = posX; }
    public Double getPosY() { return posY; }
    public void setPosY(Double posY) { this.posY = posY; }
    public Double getPosZ() { return posZ; }
    public void setPosZ(Double posZ) { this.posZ = posZ; }
    public Double getScale() { return scale; }
    public void setScale(Double scale) { this.scale = scale; }
    public Double getRotation() { return rotation; }
    public void setRotation(Double rotation) { this.rotation = rotation; }
}
