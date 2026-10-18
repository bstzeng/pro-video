// 由 tools/build.py 產生，請勿手動編輯；要改內容請改 clips/clips.json 後重跑。
window.GALLERY = {
  "professorBase": "https://bstzeng.github.io/professor/",
  "categories": [
    {
      "id": "ai",
      "label": "AI 與機器學習",
      "icon": "🤖"
    },
    {
      "id": "math",
      "label": "數學",
      "icon": "📐"
    },
    {
      "id": "science",
      "label": "物理與宇宙學",
      "icon": "🔭"
    }
  ],
  "topics": {
    "chaos-theory": {
      "title": "混沌理論：決定論中的不可預測",
      "short": "混沌理論",
      "icon": "🦋",
      "category": "math",
      "url": "https://bstzeng.github.io/professor/topics/chaos-theory/index.html"
    },
    "monte-carlo": {
      "title": "蒙地卡羅方法：用隨機算出確定的答案",
      "short": "蒙地卡羅方法",
      "icon": "🎯",
      "category": "math",
      "url": "https://bstzeng.github.io/professor/topics/monte-carlo/index.html"
    },
    "statistical-physics": {
      "title": "統計物理與相變：從原子的亂到宏觀的序",
      "short": "統計物理與相變",
      "icon": "🎲",
      "category": "science",
      "url": "https://bstzeng.github.io/professor/topics/statistical-physics/index.html"
    },
    "deep-learning": {
      "title": "神經網路與深度學習：從一個神經元到 Transformer",
      "short": "神經網路與深度學習",
      "icon": "🧠",
      "category": "ai",
      "url": "https://bstzeng.github.io/professor/topics/deep-learning/index.html"
    }
  },
  "clips": [
    {
      "id": "double-pendulum",
      "topic": "chaos-theory",
      "title": "兩個雙擺，差 0.001 度",
      "caption": "起始角度幾乎相同的兩個雙擺，幾秒後就走上完全不同的路——蝴蝶效應最直觀的樣子。",
      "gif": "gifs/chaos-theory/double-pendulum.gif",
      "poster": "gifs/chaos-theory/double-pendulum.png",
      "w": 658,
      "h": 399,
      "seconds": 7.4,
      "kb": 197,
      "lesson": {
        "label": "第 1 課",
        "title": "混沌不是亂",
        "url": "https://bstzeng.github.io/professor/topics/chaos-theory/lesson-01.html"
      }
    },
    {
      "id": "monte-carlo-pi",
      "topic": "monte-carlo",
      "title": "丟點估計 π",
      "caption": "往正方形裡隨機丟點，落在四分之一圓內的比例乘以 4，就會慢慢逼近 π。",
      "gif": "gifs/monte-carlo/monte-carlo-pi.gif",
      "poster": "gifs/monte-carlo/monte-carlo-pi.png",
      "w": 680,
      "h": 412,
      "seconds": 8.2,
      "kb": 144,
      "lesson": {
        "label": "第 4 課",
        "title": "丟點估計 π",
        "url": "https://bstzeng.github.io/professor/topics/monte-carlo/lesson-04.html"
      }
    },
    {
      "id": "random-walk-diffusion",
      "topic": "statistical-physics",
      "title": "400 個粒子的隨機漫步",
      "caption": "每個粒子都亂走，整體卻像墨水滴進水裡一樣擴散開來，寬度隨 √t 成長。",
      "gif": "gifs/statistical-physics/random-walk-diffusion.gif",
      "poster": "gifs/statistical-physics/random-walk-diffusion.png",
      "w": 658,
      "h": 536,
      "seconds": 6.7,
      "kb": 514,
      "lesson": {
        "label": "第 4 課",
        "title": "隨機漫步與擴散",
        "url": "https://bstzeng.github.io/professor/topics/statistical-physics/lesson-04.html"
      }
    },
    {
      "id": "gradient-descent",
      "topic": "deep-learning",
      "title": "梯度下降：往山下走",
      "caption": "紅球每一步都沿著斜率最陡的方向往下走，最後停在谷底——神經網路學習的核心動作。",
      "gif": "gifs/deep-learning/gradient-descent.gif",
      "poster": "gifs/deep-learning/gradient-descent.png",
      "w": 642,
      "h": 243,
      "seconds": 7.0,
      "kb": 21,
      "lesson": {
        "label": "第 5 課",
        "title": "梯度下降：往山下走的盲人",
        "url": "https://bstzeng.github.io/professor/topics/deep-learning/lesson-05.html"
      }
    },
    {
      "id": "gas-expansion",
      "topic": "statistical-physics",
      "title": "拉開隔板，氣體不會自己回去",
      "caption": "隔板一拉開，粒子很快就擠滿整個盒子；全部跑回左邊的機率小到永遠看不到，這就是熵增加。",
      "gif": "gifs/statistical-physics/gas-expansion.gif",
      "poster": "gifs/statistical-physics/gas-expansion.png",
      "w": 658,
      "h": 427,
      "seconds": 6.7,
      "kb": 354,
      "lesson": {
        "label": "",
        "title": "統計物理互動實驗室",
        "url": "https://bstzeng.github.io/professor/topics/statistical-physics/lab.html"
      }
    },
    {
      "id": "ising-model",
      "topic": "statistical-physics",
      "title": "伊辛模型：臨界點的磁區",
      "caption": "溫度調在臨界點 T≈2.27：大大小小的同向磁區不斷生成、合併又碎裂，看不出特徵尺度。",
      "gif": "gifs/statistical-physics/ising-model.gif",
      "poster": "gifs/statistical-physics/ising-model.png",
      "w": 658,
      "h": 577,
      "seconds": 6.8,
      "kb": 412,
      "lesson": {
        "label": "",
        "title": "統計物理互動實驗室",
        "url": "https://bstzeng.github.io/professor/topics/statistical-physics/lab.html"
      }
    }
  ]
};
