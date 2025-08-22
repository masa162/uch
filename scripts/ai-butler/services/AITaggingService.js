import { ImageAnnotatorClient } from '@google-cloud/vision'
import fs from 'fs'
import path from 'path'

class AITaggingService {
  constructor() {
    this.enabled = process.env.ENABLE_AI_TAGGING === 'true'
    this.confidenceThreshold = parseFloat(process.env.AI_TAG_CONFIDENCE_THRESHOLD) || 0.7
    
    if (this.enabled) {
      const keyFilePath = process.env.GOOGLE_CLOUD_KEYFILE
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
      
      if (!keyFilePath || !projectId) {
        console.warn('Google Cloud Vision API 設定が不完全です。AIタグ付けは無効化されます。')
        this.enabled = false
        return
      }

      if (!fs.existsSync(keyFilePath)) {
        console.warn(`Google Cloud キーファイルが見つかりません: ${keyFilePath}`)
        this.enabled = false
        return
      }

      try {
        this.client = new ImageAnnotatorClient({
          projectId: projectId,
          keyFilename: keyFilePath
        })
        console.log('Google Cloud Vision API クライアントを初期化しました')
      } catch (error) {
        console.error('Google Cloud Vision API 初期化エラー:', error)
        this.enabled = false
      }
    }
  }

  async analyzeImage(imagePath) {
    if (!this.enabled) {
      console.log('AIタグ付けが無効化されています')
      return []
    }

    try {
      console.log(`画像分析を開始: ${path.basename(imagePath)}`)
      
      // ラベル検出
      const [labelResult] = await this.client.labelDetection(imagePath)
      const labels = labelResult.labelAnnotations || []
      
      // オブジェクト検出
      const [objectResult] = await this.client.objectLocalization(imagePath)
      const objects = objectResult.localizedObjectAnnotations || []
      
      // テキスト検出
      const [textResult] = await this.client.textDetection(imagePath)
      const textAnnotations = textResult.textAnnotations || []
      
      // 結果をマージして信頼度でフィルタリング
      const tags = []
      
      // ラベルからタグを抽出
      labels.forEach(label => {
        if (label.score >= this.confidenceThreshold) {
          tags.push({
            tag: this.translateToJapanese(label.description),
            confidence: label.score,
            source: 'AI',
            type: 'label'
          })
        }
      })
      
      // オブジェクトからタグを抽出
      objects.forEach(object => {
        if (object.score >= this.confidenceThreshold) {
          tags.push({
            tag: this.translateToJapanese(object.name),
            confidence: object.score,
            source: 'AI',
            type: 'object'
          })
        }
      })
      
      // 重複を除去し、信頼度の高い順にソート
      const uniqueTags = this.deduplicateTags(tags)
      const sortedTags = uniqueTags.sort((a, b) => b.confidence - a.confidence)
      
      console.log(`画像分析完了: ${sortedTags.length}個のタグを検出`)
      return sortedTags.slice(0, 10) // 最大10個のタグ
      
    } catch (error) {
      console.error('画像分析エラー:', error)
      return []
    }
  }
  
  translateToJapanese(englishTerm) {
    // 基本的な英日翻訳マップ
    const translations = {
      'Person': '人',
      'Face': '顔',
      'Smile': '笑顔',
      'Child': '子供',
      'Baby': '赤ちゃん',
      'Family': '家族',
      'Dog': '犬',
      'Cat': '猫',
      'Pet': 'ペット',
      'Food': '食べ物',
      'Cake': 'ケーキ',
      'Birthday': '誕生日',
      'Car': '車',
      'Beach': '海',
      'Mountain': '山',
      'Tree': '木',
      'Flower': '花',
      'Sky': '空',
      'Cloud': '雲',
      'Water': '水',
      'Building': '建物',
      'House': '家',
      'Room': '部屋',
      'Kitchen': 'キッチン',
      'Garden': '庭',
      'Park': '公園',
      'School': '学校',
      'Wedding': '結婚式',
      'Party': 'パーティー',
      'Travel': '旅行',
      'Vacation': '休暇',
      'Christmas': 'クリスマス',
      'Holiday': '祝日',
      'Sport': 'スポーツ',
      'Game': 'ゲーム',
      'Book': '本',
      'Music': '音楽',
      'Art': 'アート',
      'Nature': '自然',
      'Animal': '動物',
      'Bird': '鳥',
      'Fish': '魚',
      'Insect': '昆虫',
      'Vehicle': '乗り物',
      'Bicycle': '自転車',
      'Train': '電車',
      'Airplane': '飛行機',
      'Boat': '船',
      'Clothing': '衣服',
      'Shoe': '靴',
      'Hat': '帽子',
      'Glasses': 'メガネ',
      'Toy': 'おもちゃ',
      'Ball': 'ボール',
      'Doll': '人形',
      'Technology': '技術',
      'Computer': 'コンピューター',
      'Phone': '電話',
      'Camera': 'カメラ',
      'Television': 'テレビ'
    }
    
    return translations[englishTerm] || englishTerm.toLowerCase()
  }
  
  deduplicateTags(tags) {
    const seen = new Set()
    return tags.filter(tag => {
      const key = tag.tag.toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }
  
  isEnabled() {
    return this.enabled
  }
}

export default AITaggingService