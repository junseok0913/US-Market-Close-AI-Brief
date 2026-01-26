#!/usr/bin/env python3
"""
Compress artwork.jpg to meet podcast requirements:
- Size: < 500KB
- Dimensions: 1400x1400 to 3000x3000 (square)
"""

from PIL import Image
import os

input_file = "AWS/artwork.jpg"
output_file = "AWS/artwork.jpg"

# Open image
img = Image.open(input_file)
print(f"Original: {img.size}, {os.path.getsize(input_file) / 1024 / 1024:.2f}MB")

# Resize to 2048x2048 if needed (good balance between quality and size)
if img.size[0] > 2048 or img.size[1] > 2048:
    img = img.resize((2048, 2048), Image.Resampling.LANCZOS)
    print(f"Resized to: {img.size}")

# Convert to RGB if needed
if img.mode != 'RGB':
    img = img.convert('RGB')

# Save with progressive compression, quality 85
img.save(output_file, "JPEG", quality=85, optimize=True, progressive=True)

final_size = os.path.getsize(output_file) / 1024
print(f"Final: {img.size}, {final_size:.0f}KB")

if final_size > 500:
    # If still too large, reduce quality
    quality = 75
    while final_size > 500 and quality > 50:
        img.save(output_file, "JPEG", quality=quality, optimize=True, progressive=True)
        final_size = os.path.getsize(output_file) / 1024
        print(f"Trying quality={quality}: {final_size:.0f}KB")
        quality -= 5

print(f"✅ Done! Final size: {final_size:.0f}KB")
