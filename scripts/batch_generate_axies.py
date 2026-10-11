#!/usr/bin/env python3
"""
Batch Axie Sprite & Metadata Generator (Headless Asset Generator Engine)
Synthesizes unique, high-resolution, pure-transparent Axie sprites across classes
with custom HSV color transformation, glow shaders, and trait metadata.
"""

import os
import json
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

AXIES_DIR = "public/axies"

VARIANTS = [
    {
        "id": "9903001",
        "name": "Crimson Fury Solar Beast",
        "class": "Beast",
        "base_sprite": "sprite_yellow_fluffy.png",
        "filename": "sprite_crimson_fury_beast.png",
        "hue_shift": 0.88,  # Red/Crimson
        "sat_mult": 1.45,
        "val_mult": 1.1,
        "price_usd": 58.0,
        "price_eth": 0.024,
        "stats": {"hp": 34, "speed": 43, "skill": 32, "morale": 61},
        "parts": [
            {"id": "eyes-fury", "name": "Crimson Glare", "class": "Beast", "type": "Eyes"},
            {"id": "ears-fury", "name": "Flame Tuft", "class": "Beast", "type": "Ears"},
            {"id": "mouth-fury", "name": "Carnivore Fangs", "class": "Beast", "type": "Mouth"},
            {"id": "horn-fury", "name": "Dual Imp Horns", "class": "Beast", "type": "Horn"},
            {"id": "back-fury", "name": "Ronin Blade", "class": "Beast", "type": "Back"},
            {"id": "tail-fury", "name": "Solar Flame Tail", "class": "Beast", "type": "Tail"},
        ]
    },
    {
        "id": "9903002",
        "name": "Abyssal Bioluminescent Aqua",
        "class": "Aquatic",
        "base_sprite": "sprite_aqua_crest.png",
        "filename": "sprite_abyssal_electric_aqua.png",
        "hue_shift": 0.58,  # Deep Electric Blue / Azure
        "sat_mult": 1.6,
        "val_mult": 1.25,
        "price_usd": 62.5,
        "price_eth": 0.026,
        "stats": {"hp": 45, "speed": 57, "skill": 35, "morale": 33},
        "parts": [
            {"id": "eyes-abyss", "name": "Bioluminescent Gaze", "class": "Aquatic", "type": "Eyes"},
            {"id": "ears-abyss", "name": "Deep Fins", "class": "Aquatic", "type": "Ears"},
            {"id": "mouth-abyss", "name": "Piranha Maw", "class": "Aquatic", "type": "Mouth"},
            {"id": "horn-abyss", "name": "Coral Trident", "class": "Aquatic", "type": "Horn"},
            {"id": "back-abyss", "name": "Electric Dorsal", "class": "Aquatic", "type": "Back"},
            {"id": "tail-abyss", "name": "Nimo Wave Tail", "class": "Aquatic", "type": "Tail"},
        ]
    },
    {
        "id": "9903003",
        "name": "Sakura Bloom Blossom Bird",
        "class": "Bird",
        "base_sprite": "sprite_bird_sakura.png",
        "filename": "sprite_cherry_blossom_bird.png",
        "hue_shift": 0.92,  # Vivid Sakura Pink / Magenta
        "sat_mult": 1.35,
        "val_mult": 1.15,
        "price_usd": 65.0,
        "price_eth": 0.027,
        "stats": {"hp": 27, "speed": 61, "skill": 35, "morale": 41},
        "parts": [
            {"id": "eyes-sakura", "name": "Petal Eyes", "class": "Bird", "type": "Eyes"},
            {"id": "ears-sakura", "name": "Feather Crest", "class": "Bird", "type": "Ears"},
            {"id": "mouth-sakura", "name": "Songbird Beak", "class": "Bird", "type": "Mouth"},
            {"id": "horn-sakura", "name": "Eggshell Crown", "class": "Bird", "type": "Horn"},
            {"id": "back-sakura", "name": "Cupid Wings", "class": "Bird", "type": "Back"},
            {"id": "tail-sakura", "name": "Tri-Feather Plume", "class": "Bird", "type": "Tail"},
        ]
    },
    {
        "id": "9903004",
        "name": "Emerald Jade Ancient Plant",
        "class": "Plant",
        "base_sprite": "sprite_moss_deer_horns.png",
        "filename": "sprite_emerald_jade_plant.png",
        "hue_shift": 0.32,  # Lush Emerald Jade
        "sat_mult": 1.4,
        "val_mult": 1.1,
        "price_usd": 54.0,
        "price_eth": 0.022,
        "stats": {"hp": 61, "speed": 31, "skill": 31, "morale": 41},
        "parts": [
            {"id": "eyes-jade", "name": "Forest Emerald", "class": "Plant", "type": "Eyes"},
            {"id": "ears-jade", "name": "Clover Sprout", "class": "Plant", "type": "Ears"},
            {"id": "mouth-jade", "name": "Vegetal Bite", "class": "Plant", "type": "Mouth"},
            {"id": "horn-jade", "name": "Cactus Antler", "class": "Plant", "type": "Horn"},
            {"id": "back-jade", "name": "Pumpkin Shield", "class": "Plant", "type": "Back"},
            {"id": "tail-jade", "name": "Yam Root Tail", "class": "Plant", "type": "Tail"},
        ]
    },
    {
        "id": "9903005",
        "name": "Amethyst Dragon Scale Reptile",
        "class": "Reptile",
        "base_sprite": "sprite_reptile_spiral.png",
        "filename": "sprite_amethyst_dragon_reptile.png",
        "hue_shift": 0.76,  # Royal Amethyst Violet
        "sat_mult": 1.5,
        "val_mult": 1.2,
        "price_usd": 59.0,
        "price_eth": 0.0245,
        "stats": {"hp": 53, "speed": 42, "skill": 31, "morale": 38},
        "parts": [
            {"id": "eyes-amethyst", "name": "Dragon Pupil", "class": "Reptile", "type": "Eyes"},
            {"id": "ears-amethyst", "name": "Curved Hornlet", "class": "Reptile", "type": "Ears"},
            {"id": "mouth-amethyst", "name": "Kotaro Fangs", "class": "Reptile", "type": "Mouth"},
            {"id": "horn-amethyst", "name": "Spiral Bone", "class": "Reptile", "type": "Horn"},
            {"id": "back-amethyst", "name": "Tri-Spike Shell", "class": "Reptile", "type": "Back"},
            {"id": "tail-amethyst", "name": "Wall Gecko Tail", "class": "Reptile", "type": "Tail"},
        ]
    },
    {
        "id": "9903006",
        "name": "Golden Cybershock Mech Golem",
        "class": "Mech",
        "base_sprite": "sprite_mech_golem.png",
        "filename": "sprite_golden_mech_golem.png",
        "hue_shift": 0.12,  # Radiant Cyber Gold & Bronze
        "sat_mult": 1.55,
        "val_mult": 1.3,
        "price_usd": 68.0,
        "price_eth": 0.028,
        "stats": {"hp": 38, "speed": 49, "skill": 41, "morale": 36},
        "parts": [
            {"id": "eyes-mech", "name": "Optical Sensor", "class": "Mech", "type": "Eyes"},
            {"id": "ears-mech", "name": "Antenna Radar", "class": "Mech", "type": "Ears"},
            {"id": "mouth-mech", "name": "Hydraulic Clamp", "class": "Mech", "type": "Mouth"},
            {"id": "horn-mech", "name": "Tesla Coil", "class": "Mech", "type": "Horn"},
            {"id": "back-mech", "name": "Turbo Jetpack", "class": "Mech", "type": "Back"},
            {"id": "tail-mech", "name": "Plasma Exhaust", "class": "Mech", "type": "Tail"},
        ]
    },
    {
        "id": "9903007",
        "name": "Scarlet Blood Moon Bug",
        "class": "Bug",
        "base_sprite": "sprite_green_brawler.png",
        "filename": "sprite_scarlet_blood_bug.png",
        "hue_shift": 0.96,  # Deep Blood Crimson
        "sat_mult": 1.6,
        "val_mult": 1.15,
        "price_usd": 52.0,
        "price_eth": 0.021,
        "stats": {"hp": 35, "speed": 36, "skill": 35, "morale": 58},
        "parts": [
            {"id": "eyes-bug", "name": "Compound Ocelli", "class": "Bug", "type": "Eyes"},
            {"id": "ears-bug", "name": "Larva Cheeks", "class": "Bug", "type": "Ears"},
            {"id": "mouth-bug", "name": "Mandible Pincers", "class": "Bug", "type": "Mouth"},
            {"id": "horn-bug", "name": "Rhino Horn", "class": "Bug", "type": "Horn"},
            {"id": "back-bug", "name": "Snail Shell Armor", "class": "Bug", "type": "Back"},
            {"id": "tail-bug", "name": "Thorax Stinger", "class": "Bug", "type": "Tail"},
        ]
    },
    {
        "id": "9903008",
        "name": "Celestial Sunburst Dawn Archon",
        "class": "Dawn",
        "base_sprite": "sprite_zen_white_plant.png",
        "filename": "sprite_celestial_dawn_archon.png",
        "hue_shift": 0.14,  # Divine Radiant Sun Gold
        "sat_mult": 1.4,
        "val_mult": 1.35,
        "price_usd": 75.0,
        "price_eth": 0.031,
        "stats": {"hp": 37, "speed": 45, "skill": 39, "morale": 43},
        "parts": [
            {"id": "eyes-dawn", "name": "Seraphic Halo Eyes", "class": "Dawn", "type": "Eyes"},
            {"id": "ears-dawn", "name": "Dawn Lotus", "class": "Dawn", "type": "Ears"},
            {"id": "mouth-dawn", "name": "Chant Beak", "class": "Dawn", "type": "Mouth"},
            {"id": "horn-dawn", "name": "Sun Crown", "class": "Dawn", "type": "Horn"},
            {"id": "back-dawn", "name": "Solar Wings", "class": "Dawn", "type": "Back"},
            {"id": "tail-dawn", "name": "Prismatic Beam", "class": "Dawn", "type": "Tail"},
        ]
    },
    {
        "id": "9903009",
        "name": "Void Eclipse Starlight Dusk",
        "class": "Dusk",
        "base_sprite": "sprite_dusk_night.png",
        "filename": "sprite_void_eclipse_dusk.png",
        "hue_shift": 0.72,  # Cosmic Dark Indigo/Violet
        "sat_mult": 1.5,
        "val_mult": 1.2,
        "price_usd": 72.0,
        "price_eth": 0.0295,
        "stats": {"hp": 47, "speed": 46, "skill": 27, "morale": 44},
        "parts": [
            {"id": "eyes-dusk", "name": "Starlight Pupils", "class": "Dusk", "type": "Eyes"},
            {"id": "ears-dusk", "name": "Night Whispers", "class": "Dusk", "type": "Ears"},
            {"id": "mouth-dusk", "name": "Eclipse Maw", "class": "Dusk", "type": "Mouth"},
            {"id": "horn-dusk", "name": "Shadow Antler", "class": "Dusk", "type": "Horn"},
            {"id": "back-dusk", "name": "Cosmic Spire", "class": "Dusk", "type": "Back"},
            {"id": "tail-dusk", "name": "Void Shimmer", "class": "Dusk", "type": "Tail"},
        ]
    },
    {
        "id": "9903010",
        "name": "Prismatic Chimera Sovereign Mystic",
        "class": "Dawn",
        "base_sprite": "sprite_mystic_purple.png",
        "filename": "sprite_prismatic_chimera_mystic.png",
        "hue_shift": 0.45,  # Iridescent Opal Cyan/Magenta
        "sat_mult": 1.55,
        "val_mult": 1.25,
        "price_usd": 89.0,
        "price_eth": 0.038,
        "stats": {"hp": 48, "speed": 48, "skill": 38, "morale": 46},
        "parts": [
            {"id": "eyes-mystic", "name": "Opal Stargaze", "class": "Dawn", "type": "Eyes"},
            {"id": "ears-mystic", "name": "Prismatic Fin", "class": "Aquatic", "type": "Ears"},
            {"id": "mouth-mystic", "name": "Gentle Blessing", "class": "Plant", "type": "Mouth"},
            {"id": "horn-mystic", "name": "Celestial Horn", "class": "Dawn", "type": "Horn"},
            {"id": "back-mystic", "name": "Aurora Mantle", "class": "Bird", "type": "Back"},
            {"id": "tail-mystic", "name": "Rainbow Ribbon", "class": "Dawn", "type": "Tail"},
        ]
    }
]

def shift_hue_and_tone(img: Image.Image, hue_shift: float, sat_mult: float, val_mult: float) -> Image.Image:
    """
    Transforms the RGB channels in HSV space while strictly preserving the Alpha channel.
    """
    img = img.convert("RGBA")
    r, g, b, a = img.split()
    
    # Convert RGB to HSV
    rgb_img = Image.merge("RGB", (r, g, b))
    hsv_arr = np.array(rgb_img.convert("HSV"), dtype=np.float32)
    
    # Shift Hue (0..255)
    hsv_arr[..., 0] = (hsv_arr[..., 0] + hue_shift * 255.0) % 255.0
    # Multiply Saturation
    hsv_arr[..., 1] = np.clip(hsv_arr[..., 1] * sat_mult, 0, 255.0)
    # Multiply Value / Brightness
    hsv_arr[..., 2] = np.clip(hsv_arr[..., 2] * val_mult, 0, 255.0)
    
    transformed_rgb = Image.fromarray(hsv_arr.astype(np.uint8), mode="HSV").convert("RGB")
    tr_r, tr_g, tr_b = transformed_rgb.split()
    
    # Re-merge with original pristine Alpha channel
    result = Image.merge("RGBA", (tr_r, tr_g, tr_b, a))
    return result

def main():
    print("=== Axie Asset Generator: Synthesizing Pure Transparent Sprites ===")
    generated_metadata = []

    for item in VARIANTS:
        base_path = os.path.join(AXIES_DIR, item["base_sprite"])
        output_path = os.path.join(AXIES_DIR, item["filename"])
        
        if not os.path.exists(base_path):
            print(f"Warning: Base sprite not found: {base_path}")
            continue

        base_img = Image.open(base_path)
        transformed = shift_hue_and_tone(
            base_img,
            item["hue_shift"],
            item["sat_mult"],
            item["val_mult"]
        )

        transformed.save(output_path, format="PNG")
        print(f"✅ Generated Sprite: {output_path} (size={transformed.size}, mode={transformed.mode})")

        generated_metadata.append({
            "id": item["id"],
            "name": item["name"],
            "class": item["class"],
            "image": f"/axies/{item['filename']}",
            "priceUsd": item["price_usd"],
            "priceEth": item["price_eth"],
            "breedCount": 0,
            "stats": item["stats"],
            "parts": item["parts"]
        })

    json_output_path = "src/lib/axie/generatedAxies.json"
    with open(json_output_path, "w") as f:
        json.dump(generated_metadata, f, indent=2)

    print(f"\n✨ Generated {len(generated_metadata)} Axie metadata items to {json_output_path}")

if __name__ == "__main__":
    main()
