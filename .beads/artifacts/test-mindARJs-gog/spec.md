# AR Image Tracking với Next.js

**Bead:** test-mindARJs-gog
**Created:** 2026-01-09

## Goal

Xây dựng web application sử dụng Next.js với khả năng AR image tracking, hiển thị 3D models lên các marker/image được track (tương tự Vuforia nhưng trên web).

## Success Criteria

- [ ] Research hoàn thành: Chọn được framework AR phù hợp
  - Verify: Có comparison document với pros/cons
- [ ] Next.js project setup với AR integration
  - Verify: `npm run dev` chạy không lỗi
- [ ] Image tracking hoạt động trên cả mobile và desktop browser
  - Verify: Test trên Chrome desktop + Chrome mobile
- [ ] 3D model hiển thị khi detect marker/image
  - Verify: Scan marker → 3D model xuất hiện

## Requirements

### Functional
- Hỗ trợ nhiều loại marker: Hiro, Aruco, Barcode, Pattern, Custom image
- Hiển thị 3D models (GLB/GLTF format)
- Hoạt động trên mobile browser + desktop browser

### Non-Functional
- Performance: Balance giữa accuracy và speed
- Open source framework
- Tích hợp được với Next.js

## Constraints

**Must:** 
- Sử dụng open source framework
- Compatible với Next.js App Router
- Hỗ trợ image tracking (không chỉ marker-based)

**Never:**
- Sử dụng paid SDK (8th Wall, Vuforia, etc.)
- Server-side AR processing (phải client-side)

## Subtasks

| ID | Title | Status | Blocked By |
|----|-------|--------|------------|
| test-mindARJs-94t | Research AR JS frameworks | READY | - |
| test-mindARJs-atu | Setup Next.js project cho AR | blocked | 94t |
| test-mindARJs-tuo | Implement image tracking với 3D model | blocked | atu |

## Research Candidates

- **MindAR.js** - Image tracking, face tracking
- **AR.js** - Marker-based, NFT (image) tracking
- **tracking.js** - Computer vision library
- **A-Frame** - VR/AR framework (often used with AR.js)

## Notes

Target giống Vuforia web experience: scan image → overlay 3D content.
