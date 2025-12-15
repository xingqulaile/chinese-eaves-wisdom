import { QuizQuestion, Achievement } from './types';

// Chinese Traditional Colors
export const COLORS = {
  vermilion: '#C83C23', // 朱红
  ink: '#2D2D2D',      // 墨色
  riceWhite: '#F7F5F0', // 米白
  jade: '#7A9D96',     // 玉色
  gold: '#E0B25D',     // 金色 (Standard)
  warmSun: '#FFB347',  // 暖阳 (Warm Orange)
  rainBlue: '#4A90E2',
  shadowGrey: '#A0A0A0'
};

export const QUESTION_POOL: QuizQuestion[] = [
  // Physics & Mechanics
  {
    id: 1,
    type: 'choice',
    question: "如果屋檐不翘起来（平檐），雨水主要会落在哪里？",
    options: ["飞向远处", "紧贴墙根", "屋顶上方", "飘向天空"],
    correctIndex: 1,
    explanation: "平檐无法提供向外的抛射力，雨水会顺着重力直落，容易溅湿墙基，导致木柱腐烂。"
  },
  {
    id: 6,
    type: 'choice',
    question: "【物理】从力学角度看，飞檐的曲线末端切线方向决定了雨水的？",
    options: ["下落重量", "初速度方向", "空气阻力", "蒸发速度"],
    correctIndex: 1,
    explanation: "曲线末端的切线方向决定了水流离开屋檐时的速度方向（水平分量），这直接影响了平抛运动的距离。"
  },
  {
    id: 8,
    type: 'boolean',
    question: "【物理】屋檐越长，杠杆力臂越长，对支撑结构的受力要求就越高，对吗？",
    options: ["正确", "错误"],
    correctIndex: 0,
    explanation: "正确。深远的屋檐意味着重心外移，力臂增加，因此中国古建发展出了复杂的斗拱结构来平衡这种巨大的力矩。"
  },
  
  // Environment & Function
  {
    id: 2,
    type: 'choice',
    question: "翘檐在夏天对室内环境有什么主要帮助？",
    options: ["增加湿气", "阻挡高角度阳光", "吸引鸟类筑巢", "增加重量"],
    correctIndex: 1,
    explanation: "夏季太阳高度角大，翘起的屋檐像遮阳伞一样阻挡烈日直射，保持室内凉爽。"
  },
  {
    id: 4,
    type: 'choice',
    question: "在“建筑师模式”中，为什么不仅要考虑角度，还要考虑屋檐长度？",
    options: ["为了更费材料", "为了平衡排水距离与采光遮阳", "为了增加重量防止被风吹走", "以上都不是"],
    correctIndex: 1,
    explanation: "屋檐长度直接影响遮阳范围和排水距离，是除了角度外最重要的设计参数。"
  },

  // Aesthetics & Culture
  {
    id: 3,
    type: 'choice',
    question: "中国古建筑中体现“天人合一”思想的是？",
    options: ["厚重的墙体", "深邃的地基", "如鸟翼般舒展的屋檐", "笔直的柱子"],
    correctIndex: 2,
    explanation: "飞檐翘角曲线优美，形如鸟翼，打破了建筑的沉重感，象征着人与自然的和谐共生及对天空的向往。"
  },
  {
    id: 5,
    type: 'boolean',
    question: "“如鸟斯革，如翚斯飞”是用来形容建筑斗拱结构的复杂程度的，对吗？",
    options: ["正确", "错误"],
    correctIndex: 1,
    explanation: "错误。这句话出自《诗经》，是形容屋顶飞檐像鸟儿展翅一样轻盈飞动的视觉美感，而非斗拱。"
  },
  {
    id: 9,
    type: 'choice',
    question: "【文学】《诗经》中形容飞檐像色彩斑斓的锦鸡展翅高飞的字是？",
    options: ["革 (gé)", "翚 (huī)", "翼 (yì)", "翔 (xiáng)"],
    correctIndex: 1,
    explanation: "“如翚斯飞”中的“翚”指五彩斑斓的锦鸡（野鸡），形容屋檐色彩绚丽且形态轻盈。"
  },

  // History & Math
  {
    id: 7,
    type: 'choice',
    question: "【历史】唐代建筑与清代建筑相比，屋檐曲线通常呈现什么特点？",
    options: ["唐代更陡峭，清代更平缓", "唐代平缓舒展，清代陡峭高耸", "两者一样", "唐代是直线的"],
    correctIndex: 1,
    explanation: "唐代建筑屋檐举折平缓，气魄宏大舒展；清代建筑举架陡峭，装饰性更强，更为高耸。"
  },
  {
    id: 10,
    type: 'choice',
    question: "【数学】中国古建屋顶曲线的设计方法“举折法”，本质上是利用了什么几何原理？",
    options: ["正弦波", "折线逼近曲线", "圆形切线", "双曲线"],
    correctIndex: 1,
    explanation: "举折法（或举架法）通过调整每层檩条的高度，用多段折线连接起来，在视觉上形成一条连续流畅的凹曲线。"
  },
  {
    id: 11,
    type: 'choice',
    question: "【常识】“勾心斗角”这个成语最初是用来形容什么的？",
    options: ["宫斗剧", "建筑结构的精巧交错", "战场兵法", "棋盘布局"],
    correctIndex: 1,
    explanation: "原指宫室建筑结构的交错和精巧（“各抱地势，钩心斗角”——杜牧《阿房宫赋》），后演变为形容人际关系中的明争暗斗。"
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'scholar',
    name: '博学多才',
    description: '完成知识问答挑战',
    unlocked: false,
    icon: '📜'
  },
  {
    id: 'architect',
    name: '鲁班再世',
    description: '完成建筑师竞速挑战',
    unlocked: false,
    icon: '🏗️'
  },
  {
    id: 'aesthete',
    name: '飞檐寻美',
    description: '完成美学鉴赏学习',
    unlocked: false,
    icon: '🪶'
  }
];