'use client'

import { useState } from 'react'

import './fold-demo.css'
import type { FoldMode } from '@/lib/print-calendar'

/**
 * 立牌摺疊示意圖：左邊是印出來的平張、右邊是摺好站在桌上的樣子，右邊會播一次
 * 張開的動畫。
 *
 * 刻意畫成 2D 示意圖而不是 3D 算繪。摺好的立牌本來就不可能同時看到正反兩面，
 * 3D 視角一次也只能看一面，反而追不上「顛倒的那半轉正了」這個重點；而張開這個
 * 動作在 2D 投影裡剛好是最單純的形變，不必內插形狀（CSS 無法可靠地內插 SVG 的
 * d 或 points）：
 *
 *   橫立 V —— 摺線是水平的頂稜，兩片面板往兩側倒下成 Λ ＝ skewX。
 *   直立 V —— 摺線是垂直的書脊，兩片面板往兩側展開 ＝ scaleX。
 *
 * 兩者都以摺線為 transform-origin，摺線在動畫全程固定不動。特別注意 skewX
 * 而不是 rotate：2D 的 rotate 會連同共用的那條摺線一起轉，兩片面板就脫開了，
 * 鉸鏈接不住。skewX 只位移離原點軸線越遠的點，摺線本身原地不動。
 */

/** 橫立 V 的頂稜（摺線），水平 */
const TENT_RIDGE_Y = 24
/** 橫立 V 的面板閉合形狀：從頂稜垂直落下，skewX 之後才倒成 Λ */
const TENT_CLOSED = '161,24 193,24 193,76 161,76'

/** 直立 V 的書脊 */
const BOOK_SPINE_X = 177
const BOOK_RIGHT = '177,24 216,26 216,62 177,70'
const BOOK_LEFT = '177,24 138,26 138,62 177,70'

interface FoldDemoProps {
  mode: Extract<FoldMode, 'standTall' | 'standWide'>
}

export function FoldDemo({ mode }: FoldDemoProps) {
  const tent = mode === 'standWide'
  // 重新掛載 <svg> 就會讓 CSS 動畫從頭跑，不需要移除／再加 class 那類重啟技巧。
  // mode 也編進 key，所以切換模式時會自動播一次。
  const [replay, setReplay] = useState(0)

  return (
    <figure className="mt-2">
      <button
        type="button"
        onClick={() => setReplay(n => n + 1)}
        className="block w-full rounded-md border bg-muted/40 p-2 transition-colors hover:bg-muted"
        aria-label="重播摺疊示意動畫"
      >
        <svg
          key={`${mode}-${replay}`}
          viewBox="0 0 240 96"
          className="w-full text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeLinejoin="round"
          role="img"
          aria-label={
            tent
              ? '示意圖：直向紙張沿橫向摺線對折，上半頁的月份是顛倒的，摺起來成為正立的背面'
              : '示意圖：橫向紙張沿直向摺線對折，兩半張開後都是正立的'
          }
        >
          {tent ? <TentFlat /> : <BookFlat />}
          <Arrow />
          {tent ? <TentFolded /> : <BookFolded />}

          <Caption x={45}>平張（列印面）</Caption>
          <Caption x={177}>摺好・立在桌上</Caption>
        </svg>
      </button>

      <figcaption className="mt-1.5 text-xs text-muted-foreground">
        {tent
          ? '上半頁顛倒是對的 —— 那一半摺完會轉到背面，站起來就是正立的。'
          : '兩面都是正立的，摺完開口朝左右兩側。'}
      </figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* 平張（左）                                                          */
/* ------------------------------------------------------------------ */

/** 橫立 V：直向紙、橫向摺線。上半的月份塊轉 180°，並沿用預覽的正面／背面標籤。 */
function TentFlat() {
  return (
    <g>
      <rect x={18} y={6} width={54} height={68} rx={2} />
      <line x1={18} y1={40} x2={72} y2={40} strokeDasharray="3 2.5" opacity={0.6} />

      <FaceTag x={22} y={13}>
        背面
      </FaceTag>
      <MiniMonth x={45} y={25} rotate={180} />

      <FaceTag x={22} y={47}>
        正面
      </FaceTag>
      <MiniMonth x={45} y={59} />
    </g>
  )
}

/** 直立 V：橫向紙、直向摺線。兩半都正立，沒有正背之分，所以不標籤。 */
function BookFlat() {
  return (
    <g>
      <rect x={8} y={18} width={74} height={48} rx={2} />
      <line x1={45} y1={18} x2={45} y2={66} strokeDasharray="3 2.5" opacity={0.6} />
      <MiniMonth x={26.5} y={42} />
      <MiniMonth x={63.5} y={42} />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 摺好（右）                                                          */
/* ------------------------------------------------------------------ */

/**
 * 兩片面板用的是同一個閉合形狀，只差傾倒方向 —— 動畫因此只需要一個 skewX，
 * 不必內插任何點座標。背面先畫、正面後畫並填底色，頂稜附近的重疊才會正確遮擋。
 *
 * 月份塊放在未傾倒的座標上，讓面板的 skew 一起帶著它跑：塊跟著面板一起傾，
 * 正好賣出「內容印在這一面上」的感覺。
 */
function TentFolded() {
  const origin = { transformOrigin: `177px ${TENT_RIDGE_Y}px` }

  return (
    <g>
      {/* 兩片面板的下緣都落在 y=76 */}
      <Ground y={77} rx={44} />
      <g className="fold-demo-panel" data-fold="tent" data-side="back" style={origin}>
        <polygon points={TENT_CLOSED} fill="var(--background)" opacity={0.6} />
      </g>
      <g className="fold-demo-panel" data-fold="tent" data-side="front" style={origin}>
        <polygon points={TENT_CLOSED} fill="var(--background)" />
        <MiniMonth x={177} y={50} />
      </g>
    </g>
  )
}

/**
 * 開書狀：兩片面板繞書脊往兩側張開。從正前方看，張開就是水平方向的展開，
 * 所以用 scaleX —— 書脊（transform-origin）全程不動。
 */
function BookFolded() {
  const origin = { transformOrigin: `${BOOK_SPINE_X}px 46px` }

  return (
    <g>
      {/* 書脊是離觀者最近的那條邊，也是最低的著地點（y=70） */}
      <Ground y={71} rx={40} />
      <g className="fold-demo-panel" data-fold="book" style={origin}>
        <polygon points={BOOK_LEFT} fill="var(--background)" />
        <MiniMonth x={157.5} y={45.5} skew={-3} />
      </g>
      <g className="fold-demo-panel" data-fold="book" style={origin}>
        <polygon points={BOOK_RIGHT} fill="var(--background)" />
        <MiniMonth x={196.5} y={45.5} skew={3} />
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 零件                                                                */
/* ------------------------------------------------------------------ */

/**
 * 桌面：一條地面線加一顆淡影子，讓「站著」這件事讀得出來。
 * y 由各版面的最低著地點決定 —— 卡片浮在地面線上方會馬上露餡。
 */
function Ground({ y, rx }: { y: number; rx: number }) {
  return (
    <g>
      <ellipse
        className="fold-demo-shadow"
        cx={177}
        cy={y - 1}
        rx={rx}
        ry={2.5}
        fill="currentColor"
        stroke="none"
      />
      <line x1={130} y1={y} x2={224} y2={y} opacity={0.45} />
    </g>
  )
}

/**
 * 迷你月份塊：一條標題橫槓加三排小點。畫得夠像月曆就好 —— 這是示意圖，
 * 塞真的日期只會在 18px 寬的塊裡糊成一團。
 */
function MiniMonth({
  x,
  y,
  rotate = 0,
  skew = 0,
}: {
  x: number
  y: number
  rotate?: number
  skew?: number
}) {
  const transform = [
    `translate(${x} ${y})`,
    rotate ? `rotate(${rotate})` : '',
    skew ? `skewY(${skew})` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <g transform={transform} stroke="none">
      <rect
        x={-9}
        y={-8.5}
        width={18}
        height={2.6}
        rx={1.3}
        fill="currentColor"
        opacity={0.55}
      />
      {[-3.5, 0.5, 4.5].flatMap(cy =>
        [-7.5, -2.5, 2.5, 7.5].map(cx => (
          <circle
            key={`${cx}:${cy}`}
            cx={cx}
            cy={cy}
            r={1}
            fill="currentColor"
            opacity={0.34}
          />
        )),
      )}
    </g>
  )
}

/** 正面／背面標籤，字樣與位置刻意對齊實際預覽上的那兩顆標籤 */
function FaceTag({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} fontSize={6} fill="currentColor" stroke="none" opacity={0.75}>
      {children}
    </text>
  )
}

function Caption({ x, children }: { x: number; children: string }) {
  return (
    <text
      x={x}
      y={90}
      fontSize={7}
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      opacity={0.7}
    >
      {children}
    </text>
  )
}

function Arrow() {
  return (
    <g opacity={0.5}>
      <line x1={98} y1={40} x2={116} y2={40} />
      <polyline points="111,36 116,40 111,44" />
    </g>
  )
}
