import * as tf from '@tensorflow/tfjs'

export class PlantDiseaseClassifier {
  constructor() {
    this.model = null
    this.classNames = [
      'Apple___Apple_scab',
      'Apple___Black_rot',
      'Apple___Cedar_apple_rust',
      'Apple___healthy',
      'Blueberry___healthy',
      'Cherry_(including_sour)___Powdery_mildew',
      'Cherry_(including_sour)___healthy',
      'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
      'Corn_(maize)___Common_rust_',
      'Corn_(maize)___Northern_Leaf_Blight',
      'Corn_(maize)___healthy',
      'Grape___Black_rot',
      'Grape___Esca_(Black_Measles)',
      'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
      'Grape___healthy',
      'Orange___Haunglongbing_(Citrus_greening)',
      'Peach___Bacterial_spot',
      'Peach___healthy',
      'Pepper,_bell___Bacterial_spot',
      'Pepper,_bell___healthy',
      'Potato___Early_blight',
      'Potato___Late_blight',
      'Potato___healthy',
      'Raspberry___healthy',
      'Soybean___healthy',
      'Squash___Powdery_mildew',
      'Strawberry___Leaf_scorch',
      'Strawberry___healthy',
      'Tomato___Bacterial_spot',
      'Tomato___Early_blight',
      'Tomato___Late_blight',
      'Tomato___Leaf_Mold',
      'Tomato___Septoria_leaf_spot',
      'Tomato___Spider_mites Two-spotted_spider_mite',
      'Tomato___Target_Spot',
      'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
      'Tomato___Tomato_mosaic_virus',
      'Tomato___healthy'
    ]
    this.diseaseInfo = this.initializeDiseaseInfo()
  }

  async init() {
    this.setupEventListeners()
    await this.loadModel()
  }

  setupEventListeners() {
    const uploadBtn = document.getElementById('uploadBtn')
    const fileInput = document.getElementById('fileInput')
    const uploadArea = document.getElementById('uploadArea')

    uploadBtn.addEventListener('click', () => {
      fileInput.click()
    })

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        this.handleImageUpload(file)
      }
    })

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('drag-over')
    })

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over')
    })

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('drag-over')
      const file = e.dataTransfer.files[0]
      if (file) {
        this.handleImageUpload(file)
      }
    })
  }

  async loadModel() {
    try {
      // For demo purposes, we'll create a mock model
      // In a real implementation, you would load your trained model
      console.log('Loading AI model...')
      
      // Simulate model loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create a mock model for demonstration
      this.model = {
        predict: (tensor) => {
          // Mock prediction - in reality this would be your trained model
          const predictions = new Array(this.classNames.length).fill(0).map(() => Math.random())
          
          // Normalize to sum to 1
          const sum = predictions.reduce((a, b) => a + b, 0)
          return [predictions.map(p => p / sum)]
        }
      }
      
      console.log('Model loaded successfully')
    } catch (error) {
      console.error('Error loading model:', error)
      this.showError('Failed to load AI model. Please refresh the page and try again.')
    }
  }

  validateImage(file) {
    // Check file type
    if (!file.type.startsWith('image/')) {
      this.showError('Please upload a valid image file.')
      return false
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('File size too large. Please upload an image smaller than 10MB.')
      return false
    }

    return true
  }

  handleImageUpload(file) {
    if (!this.validateImage(file)) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      this.displayImage(e.target.result, file)
    }
    reader.readAsDataURL(file)
  }

  displayImage(imageSrc, file) {
    const imagePreview = document.getElementById('imagePreview')
    const previewImg = document.getElementById('previewImg')
    const imageInfo = document.getElementById('imageInfo')
    const uploadArea = document.getElementById('uploadArea')

    previewImg.src = imageSrc
    imageInfo.innerHTML = `
      <p><strong>File:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `

    uploadArea.style.display = 'none'
    imagePreview.style.display = 'block'

    // Add analyze button
    this.showAnalyzeButton()
  }

  showAnalyzeButton() {
    const analysisPanel = document.getElementById('analysisPanel')
    analysisPanel.innerHTML = `
      <h3>🔍 Analysis Results</h3>
      <button class="analyze-btn" id="analyzeBtn">🔬 Analyze Plant Disease</button>
      <p class="analyze-hint">Click to start AI analysis of your plant image</p>
    `

    document.getElementById('analyzeBtn').addEventListener('click', () => {
      this.analyzeImage()
    })
  }

  async analyzeImage() {
    if (!this.model) {
      this.showError('Model not loaded. Please wait and try again.')
      return
    }

    this.showLoading()

    try {
      const previewImg = document.getElementById('previewImg')
      
      // Preprocess image
      const tensor = await this.preprocessImage(previewImg)
      
      // Make prediction
      const predictions = this.model.predict(tensor)
      
      // Get top 3 results
      const results = this.getTopPredictions(predictions[0])
      
      // Display results
      this.displayResults(results)
      
      // Clean up tensor
      tensor.dispose()
      
    } catch (error) {
      console.error('Error during analysis:', error)
      this.showError('Error during analysis. Please try again with a different image.')
    }
  }

  async preprocessImage(imgElement) {
    return tf.tidy(() => {
      // Convert image to tensor
      let tensor = tf.browser.fromPixels(imgElement)
      
      // Resize to 224x224
      tensor = tf.image.resizeBilinear(tensor, [224, 224])
      
      // Normalize to [0, 1]
      tensor = tensor.div(255.0)
      
      // Add batch dimension
      tensor = tensor.expandDims(0)
      
      return tensor
    })
  }

  getTopPredictions(predictions) {
    const predArray = Array.from(predictions)
    const indexed = predArray.map((pred, idx) => ({ confidence: pred, index: idx }))
    indexed.sort((a, b) => b.confidence - a.confidence)
    
    return indexed.slice(0, 3).map(item => ({
      disease: this.classNames[item.index],
      confidence: item.confidence,
      percentage: item.confidence * 100
    }))
  }

  displayResults(results) {
    this.hideLoading()
    
    const resultsDiv = document.getElementById('results')
    const primaryResult = document.getElementById('primaryResult')
    const alternativeResults = document.getElementById('alternativeResults')
    const diseaseInfo = document.getElementById('diseaseInfo')

    // Primary result
    const topResult = results[0]
    const confidenceIcon = this.getConfidenceIcon(topResult.confidence)
    
    primaryResult.innerHTML = `
      <div class="primary-diagnosis">
        <h4>${confidenceIcon} Primary Diagnosis</h4>
        <div class="disease-name">${this.formatDiseaseName(topResult.disease)}</div>
        <div class="confidence-score">Confidence: ${this.formatConfidence(topResult.confidence)}</div>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${topResult.percentage}%"></div>
        </div>
      </div>
    `

    // Alternative results
    if (results.length > 1) {
      alternativeResults.innerHTML = `
        <h4>📊 Alternative Possibilities</h4>
        ${results.slice(1).map((result, index) => `
          <div class="alternative-result">
            <span class="alt-number">${index + 2}.</span>
            <span class="alt-disease">${this.formatDiseaseName(result.disease)}</span>
            <span class="alt-confidence">${this.formatConfidence(result.confidence)}</span>
          </div>
        `).join('')}
      `
    }

    // Disease information
    const diseaseData = this.diseaseInfo[topResult.disease] || this.getGenericDiseaseInfo(topResult.disease)
    diseaseInfo.innerHTML = this.formatDiseaseInfo(diseaseData)

    resultsDiv.style.display = 'block'
  }

  showLoading() {
    document.getElementById('loading').style.display = 'block'
    document.getElementById('analysisPanel').style.display = 'none'
    document.getElementById('results').style.display = 'none'
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none'
  }

  showError(message) {
    this.hideLoading()
    const analysisPanel = document.getElementById('analysisPanel')
    analysisPanel.innerHTML = `
      <h3>❌ Error</h3>
      <div class="error-message">${message}</div>
      <button class="retry-btn" onclick="location.reload()">Try Again</button>
    `
  }

  getConfidenceIcon(confidence) {
    if (confidence > 0.8) return '🟢'
    if (confidence > 0.6) return '🟡'
    return '🔴'
  }

  formatConfidence(confidence) {
    const percentage = (confidence * 100).toFixed(1)
    if (confidence >= 0.9) return `${percentage}% 🎯`
    if (confidence >= 0.7) return `${percentage}% ✅`
    if (confidence >= 0.5) return `${percentage}% ⚠️`
    return `${percentage}% ❓`
  }

  formatDiseaseName(diseaseName) {
    return diseaseName
      .replace(/___/g, ' - ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  formatDiseaseInfo(diseaseData) {
    return `
      <div class="disease-details">
        <h4>📖 Disease Information</h4>
        
        <div class="info-tabs">
          <div class="tab-content">
            <div class="info-section">
              <h5>📝 Description</h5>
              <p>${diseaseData.description}</p>
              ${diseaseData.symptoms ? `
                <h6>Common Symptoms:</h6>
                <ul>
                  ${diseaseData.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
            
            <div class="info-section">
              <h5>🩺 Treatment</h5>
              <ul>
                ${diseaseData.treatment.map(treatment => `<li>${treatment}</li>`).join('')}
              </ul>
              ${diseaseData.severity === 'high' ? `
                <div class="warning">⚠️ This is a serious disease. Consider consulting an agricultural expert.</div>
              ` : ''}
            </div>
            
            <div class="info-section">
              <h5>🛡️ Prevention</h5>
              <ul>
                ${diseaseData.prevention.map(prevention => `<li>${prevention}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `
  }

  initializeDiseaseInfo() {
    return {
      'Apple___Apple_scab': {
        'description': 'Apple scab is a fungal disease that affects apple trees, causing dark, scaly lesions on leaves and fruit.',
        'symptoms': [
          'Dark, olive-green to black spots on leaves',
          'Scaly lesions on fruit surface',
          'Premature leaf drop',
          'Reduced fruit quality'
        ],
        'treatment': [
          'Apply fungicide sprays during growing season',
          'Remove fallen leaves and debris',
          'Prune for better air circulation',
          'Use disease-resistant apple varieties'
        ],
        'prevention': [
          'Plant resistant varieties',
          'Ensure good air circulation',
          'Avoid overhead watering',
          'Regular sanitation practices'
        ],
        'severity': 'medium'
      },
      'Apple___Black_rot': {
        'description': 'Black rot is a serious fungal disease that affects apple trees, causing fruit rot and leaf spots.',
        'symptoms': [
          'Brown leaf spots with purple margins',
          'Black, mummified fruit',
          'Cankers on branches',
          'Premature fruit drop'
        ],
        'treatment': [
          'Remove infected fruit and branches immediately',
          'Apply copper-based fungicides',
          'Improve orchard sanitation',
          'Prune infected wood during dormant season'
        ],
        'prevention': [
          'Plant disease-resistant varieties',
          'Maintain proper tree spacing',
          'Regular pruning for air circulation',
          'Remove mummified fruit from trees'
        ],
        'severity': 'high'
      },
      'Tomato___Early_blight': {
        'description': 'Early blight is a common fungal disease affecting tomatoes, characterized by dark spots with concentric rings.',
        'symptoms': [
          'Dark spots with concentric rings on leaves',
          'Yellowing and browning of lower leaves',
          'Stem lesions near soil line',
          'Fruit spots with dark, sunken areas'
        ],
        'treatment': [
          'Apply fungicide containing chlorothalonil or copper',
          'Remove affected plant debris',
          'Improve air circulation around plants',
          'Water at soil level, not on foliage'
        ],
        'prevention': [
          'Rotate crops yearly',
          'Use drip irrigation instead of overhead watering',
          'Mulch around plants to prevent soil splash',
          'Space plants for good air circulation'
        ],
        'severity': 'medium'
      },
      'Tomato___Late_blight': {
        'description': 'Late blight is a devastating disease that can quickly destroy tomato crops, especially in cool, wet conditions.',
        'symptoms': [
          'Water-soaked spots on leaves that turn brown',
          'White fuzzy growth on leaf undersides',
          'Brown, firm lesions on fruit',
          'Rapid plant death in severe cases'
        ],
        'treatment': [
          'Apply preventive fungicides immediately',
          'Remove and destroy infected plants',
          'Avoid overhead watering',
          'Improve drainage and air circulation'
        ],
        'prevention': [
          'Use certified disease-free seeds and plants',
          'Avoid working with wet plants',
          'Provide adequate spacing between plants',
          'Apply preventive fungicide treatments'
        ],
        'severity': 'high'
      }
    }
  }

  getGenericDiseaseInfo(diseaseName) {
    if (diseaseName.toLowerCase().includes('healthy')) {
      return {
        'description': 'The plant appears to be healthy with no visible signs of disease.',
        'symptoms': ['No disease symptoms detected'],
        'treatment': ['Continue regular care and monitoring', 'Maintain good growing conditions'],
        'prevention': ['Regular inspection', 'Proper nutrition', 'Adequate watering', 'Good air circulation'],
        'severity': 'none'
      }
    }

    return {
      'description': `This appears to be ${this.formatDiseaseName(diseaseName)}. Please consult local agricultural experts for specific treatment advice.`,
      'symptoms': ['Visible symptoms detected by AI analysis'],
      'treatment': [
        'Consult with local agricultural extension service',
        'Consider appropriate fungicide or treatment based on specific disease',
        'Remove affected plant material if severe',
        'Improve growing conditions'
      ],
      'prevention': [
        'Use disease-resistant varieties when available',
        'Maintain proper plant spacing for air circulation',
        'Practice crop rotation',
        'Keep plants healthy with proper nutrition and watering'
      ],
      'severity': 'medium'
    }
  }
}