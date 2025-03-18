'use client';

import { useState, useEffect } from 'react';

/**
 * メディアクエリのマッチをチェックするカスタムフック
 * @param query メディアクエリ文字列（例：'(max-width: 768px)'）
 * @returns メディアクエリがマッチするか
 */
export function useMediaQuery(query: string): boolean {
    // サーバーサイドでは常にfalseを返す
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // ウィンドウオブジェクトがない場合は何もしない
        if (typeof window === 'undefined') {
            return;
        }

        const media = window.matchMedia(query);

        // 初期値を設定
        setMatches(media.matches);

        // リサイズなどでマッチ状態が変わったときのハンドラー
        const listener = () => {
            setMatches(media.matches);
        };

        // イベントリスナーを追加
        media.addEventListener('change', listener);

        // クリーンアップ関数
        return () => {
            media.removeEventListener('change', listener);
        };
    }, [query]);

    return matches;
}

/**
 * 現在の画面サイズに基づいてブレークポイントを提供するフック
 * @returns { isMobile, isTablet, isDesktop }
 */
export function useBreakpoint() {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    return { isMobile, isTablet, isDesktop };
} 