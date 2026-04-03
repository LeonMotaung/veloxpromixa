# Velox Proxima - Frontend & UI/UX Development
**Assignee:** Moses

## 1. Data & Training User Experience
*   **Upload Feedback System:** Overhaul the dataset/script upload flow. Integrate an active progress bar, robust file size/type validation logic prior to upload, and an overarching success toast notification.
*   **Data Validation Visualization:** On successful CSV upload, show users the inferred feature/target types and row counts. 
*   **Class Balance Summaries:** Support rendering class-balance summaries and label distribution chart previews in the UI prior to kicking off training.

## 2. Dashboard Interface Polish
*   **Component State Handling:** Apply theme-consistent loading skeletons across all interactive assets (charts, tables, parameter forms) to eliminate layout jumps. Provide well-designed "Empty States" handling to guide new users appropriately.
*   **Run List Interactions:** Enhance the model/training run list. Add granular filtering by status (success, error, training), text search by `job_id`, and display key real-time metrics (loss, accuracy, epoch duration) directly inline.

## 3. Inference UI Integration
*   **Dynamic Prediction Panel:** Craft a responsive prediction panel that actively derives and auto-fills feature templates based directly upon the parsed data schema. 
*   **Results Interpolation:** Render model outputs intelligently. E.g., for classification outputs, expose a full softmax probability output table rather than just the top prediction.
