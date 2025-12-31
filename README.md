# ShadeRoom

## Project Description and Purpose
ShadeRoom is an advanced web application that allows users to edit and manipulate room images using AI-powered segmentation. The application enables users to select specific areas of a room image and apply different colors or textures to them, making it easy to visualize interior design changes without physically altering the space.

The primary purpose of ShadeRoom is to provide a user-friendly tool for interior designers, homeowners, and real estate professionals to experiment with different color schemes and textures in room images, helping them make informed decisions about interior design changes.

## Features
- **AI-Powered Image Segmentation**: Utilizes the Segment Anything Model (SAM) to intelligently identify and select areas in room images
- **Multiple Selection Tools**:
  - Lasso tool for freeform selection
  - Polygon/Pen tool for precise manual selection
  - Hover mode for quick previews
- **Color and Texture Application**: Apply various colors and textures to selected areas
- **Responsive Design**: Works on both desktop and mobile devices
- **Real-time Preview**: See changes instantly as you edit
- **Image Processing**: Handles image compression and manipulation

## Architecture Overview
ShadeRoom is built using a modern React architecture with the following key components:

### Frontend
- **React**: UI library for building the user interface
- **Vite**: Build tool for fast development and optimized production builds
- **React Router**: For navigation between pages
- **React Konva**: Canvas manipulation for image editing
- **Tailwind CSS**: For styling and responsive design

### State Management
- **Context API**: Multiple context providers for different aspects of the application:
  - EditorProvider: Manages the image editing state
  - StepperProvider: Manages the multi-step workflow
  - GeneralProvider: Manages general application state

### ML Integration
- **ONNX Runtime**: For running the ML models in the browser
- **Segment Anything Model (SAM)**: For image segmentation
- **Backend API**: For generating image embeddings

### Data Flow
1. User uploads an image
2. Image is sent to backend for embedding generation
3. Frontend loads the SAM model for segmentation
4. User selects areas using various tools
5. Selected areas are processed by the ML model
6. User applies colors or textures to the selected areas
7. Changes are rendered in real-time on the canvas

