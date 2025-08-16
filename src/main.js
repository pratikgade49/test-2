import './style.css'
import { PlantDiseaseClassifier } from './classifier.js'

// Initialize the application
document.querySelector('#app').innerHTML = `
  <div class="container">
    <header class="header">
      <h1>🌱 Plant Disease Classifier</h1>
      <p class="subtitle">AI-powered disease detection for healthier crops</p>
    </header>

    <div class="main-content">
      <div class="upload-section">
        <div class="upload-area" id="uploadArea">
          <div class="upload-content">
            <div class="upload-icon">📤</div>
            <h3>Upload Plant Image</h3>
            <p>Choose an image of the affected plant leaf</p>
            <input type="file" id="fileInput" accept="image/*" hidden>
            <button class="upload-btn" id="uploadBtn">Choose File</button>
          </div>
        </div>
        
        <div class="image-preview" id="imagePreview" style="display: none;">
          <img id="previewImg" alt="Uploaded image">
          <div class="image-info" id="imageInfo"></div>
        </div>
      </div>

      <div class="results-section">
        <div class="analysis-panel" id="analysisPanel">
          <h3>🔍 Analysis Results</h3>
          <p class="placeholder-text">Upload an image to start the analysis</p>
          
          <div class="guidelines">
            <h4>📸 Photo Guidelines</h4>
            <ul>
              <li>Use good lighting</li>
              <li>Focus on the affected leaf</li>
              <li>Avoid blurry images</li>
              <li>Supported formats: JPG, JPEG, PNG</li>
            </ul>
          </div>
        </div>
        
        <div class="loading" id="loading" style="display: none;">
          <div class="spinner"></div>
          <p>Analyzing image... Please wait</p>
        </div>
        
        <div class="results" id="results" style="display: none;">
          <div class="primary-result" id="primaryResult"></div>
          <div class="alternative-results" id="alternativeResults"></div>
          <div class="disease-info" id="diseaseInfo"></div>
        </div>
      </div>
    </div>

    <div class="sidebar">
      <div class="info-card">
        <h4>📋 How to Use</h4>
        <ol>
          <li><strong>Upload</strong> a clear photo of the affected plant leaf</li>
          <li><strong>Wait</strong> for AI analysis (few seconds)</li>
          <li><strong>Review</strong> the disease classification results</li>
          <li><strong>Follow</strong> the treatment recommendations</li>
        </ol>
      </div>
      
      <div class="info-card">
        <h4>🔬 Supported Diseases</h4>
        <p>This AI model can identify <strong>38 different</strong> plant diseases across various crops including:</p>
        <ul>
          <li>Tomato diseases</li>
          <li>Potato diseases</li>
          <li>Corn diseases</li>
          <li>Apple diseases</li>
          <li>And many more...</li>
        </ul>
      </div>
    </div>

    <footer class="footer">
      <p>🌾 Built for farmers, by farmers. Helping grow healthier crops through AI technology.</p>
      <p class="disclaimer">⚠️ <strong>Disclaimer:</strong> This AI tool provides guidance only. For serious infections or uncertainty, consult with local agricultural experts.</p>
    </footer>
  </div>
`

// Initialize the classifier
const classifier = new PlantDiseaseClassifier()
classifier.init()