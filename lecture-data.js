/*
  LECTURE DATA — Single source of truth for Lectures pages and Presentation Mode.
  Edit course/session information here. Both the detailed HTML view and the
  presentation slides are generated from the same data.

  For each session you can later set:
    handout: 'materials/am1/01.pdf'
    video:   'https://...'
    image:   ''
  Leave them blank while materials are being prepared.
*/

const LECTURE_CATALOG = [
  {id:'am1', level:'B2', term:'1学期', title:'応用力学I', subtitle:'講義資料', en:'Applied Mechanics I', description:'力学の基礎を、構造物に働く力とその流れを意識しながら学ぶ科目です。', accent:'01'},
  {id:'am1-ex', level:'B2', term:'1学期', title:'応用力学I 演習', subtitle:'演習資料', en:'Applied Mechanics I — Exercises', description:'応用力学Iの内容を、演習問題を通じて定着させるための資料です。', accent:'02'},
  {id:'am3', level:'B3', term:'1学期', title:'応用力学III', subtitle:'講義資料', en:'Applied Mechanics III', description:'構造力学の発展的な考え方を扱い、解析と設計につながる理解を深めます。', accent:'03'},
  {id:'cad', level:'B4', term:'1学期', title:'CAD設計製図', subtitle:'講義・演習資料', en:'CAD Design & Drafting', description:'CADを用いた設計・製図の考え方と実務的な表現方法を学びます。', accent:'04'},
  {id:'bridge', level:'B4', term:'1学期', title:'橋梁工学', subtitle:'講義資料', en:'Bridge Engineering', description:'橋梁の構造形式、設計、維持管理を体系的に学ぶための講義資料です。', accent:'05'},
  {id:'adv-struct', level:'M', term:'大学院', title:'構造力学特論', subtitle:'講義資料', en:'Advanced Structural Mechanics', description:'大学院レベルの構造力学を、理論と実構造への応用を関連づけて学びます。', accent:'06'},
  {id:'theme-seminar', level:'B3', term:'2・3学期', title:'テーマセミナー', subtitle:'セミナー資料', en:'Theme Seminar', description:'研究・技術テーマを題材に、調査・議論・発表を通して理解を深めます。', accent:'07'}
];

const DEFAULT_SESSION = (n)=>({
  no:n,
  title:`第${n}回`,
  shortTitle:'内容準備中',
  summary:'この回の詳細説明をここに追加します。授業前後の予習・復習にも使えるよう、講義で扱う内容を文章として整理します。',
  objectives:['この回で理解してほしいポイントを入力','講義後にできるようになってほしいことを入力','必要に応じて演習・課題との関係を入力'],
  keywords:['KEYWORD 1','KEYWORD 2','KEYWORD 3'],
  detail:'講義中はPresentation Modeを用いて要点を説明し、詳細な式展開、補足説明、例題、参考情報はこのページで確認できる構成を想定しています。',
  handout:'',
  video:'',
  image:''
});

const LECTURE_SESSIONS = Object.fromEntries(
  LECTURE_CATALOG.map(course=>[course.id,Array.from({length:15},(_,i)=>DEFAULT_SESSION(i+1))])
);

/* Example edits can be written below. These are deliberately minimal so that
   the actual syllabus can be entered without the website inventing content. */
LECTURE_SESSIONS.am1[0] = {
  ...DEFAULT_SESSION(1),
  shortTitle:'ガイダンス・力の見方',
  summary:'応用力学Iで何を学ぶのかを確認し、構造物に作用する力をどのように捉えるかを導入します。',
  objectives:['授業全体の位置づけを理解する','構造物に作用する力を整理する','力の流れを意識して構造を見る'],
  keywords:['力','荷重','力の流れ']
};

function getLectureCourse(id){return LECTURE_CATALOG.find(c=>c.id===id)||LECTURE_CATALOG[0];}
function getLectureSessions(id){return LECTURE_SESSIONS[id]||[];}
