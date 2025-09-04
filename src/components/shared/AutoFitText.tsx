import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

interface AutoFitTextProps {
	text: string;
	style?: React.CSSProperties;
	className?: string;
	// Font size to start trying from. If not provided, it will be inferred from style.fontSize or 16
	baseFontSize?: number;
	minFontSize?: number; // Minimum font size allowed
	maxIterations?: number; // Safety guard for loops
	maxFontSize?: number; // Optional hard cap
}

/**
 * AutoFitText
 * - Adjusts font-size so the content fits inside its container (both width and height)
 * - Can shrink or grow the font to optimally use available space
 */
export const AutoFitText: React.FC<AutoFitTextProps> = ({
	text,
	style = {},
	className,
	baseFontSize,
	minFontSize = 6,
	maxIterations = 40,
	maxFontSize
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const measurerRef = useRef<HTMLDivElement>(null);
	const [fittedFontSize, setFittedFontSize] = useState<number>(() => {
		const initial = typeof baseFontSize === 'number'
			? baseFontSize
			: (typeof style.fontSize === 'number'
				? (style.fontSize as number)
				: (typeof style.fontSize === 'string' && style.fontSize.endsWith('px')
					? parseFloat(style.fontSize as string)
					: 16));
		return isFinite(initial) && initial > 0 ? initial : 16;
	});

	// Keep font family, weight, lineHeight etc. stable for measuring
	const measuringStyle = useMemo<React.CSSProperties>(() => ({
		position: 'absolute',
		visibility: 'hidden',
		pointerEvents: 'none',
		left: 0,
		top: 0,
		width: '100%',
		whiteSpace: 'pre-wrap',
		wordBreak: 'break-word',
		boxSizing: 'border-box',
		...style,
		// 🎯 FORZAR LINEHEIGHT OPTIMIZADO PARA MEDICIÓN
		lineHeight: '1.0', // Forzar lineHeight compacto para medición precisa
		// fontSize is set dynamically during fitting
	}), [style]);

	const fitsIn = (font: number, containerWidth: number, containerHeight: number, measurer: HTMLDivElement) => {
		measurer.style.fontSize = `${font}px`;
		measurer.textContent = text || '\u200b';
		
		// Force layout recalculation
		measurer.offsetHeight;
		
		const fits = measurer.scrollWidth <= containerWidth && measurer.scrollHeight <= containerHeight;
		
		// 🔍 DEBUG para números específicos
		const shouldDebug = text.includes('349') || text.includes('999') || font > 200;
		if (shouldDebug) {
			console.log(`🔍 [FITSLN] "${text}" @ ${font}px:`, {
				font,
				scrollWidth: measurer.scrollWidth,
				scrollHeight: measurer.scrollHeight,
				containerWidth,
				containerHeight,
				widthFits: measurer.scrollWidth <= containerWidth,
				heightFits: measurer.scrollHeight <= containerHeight,
				fits,
				measurerStyles: {
					fontSize: measurer.style.fontSize,
					fontFamily: measurer.style.fontFamily,
					lineHeight: measurer.style.lineHeight
				}
			});
		}
		
		return fits;
	};

	const recalc = () => {
		const container = containerRef.current;
		const measurer = measurerRef.current;
		if (!container || !measurer) return;

		const containerWidth = container.clientWidth;
		const containerHeight = container.clientHeight;
		if (containerWidth <= 0 || containerHeight <= 0) return;

		// 🔍 DEBUG: Log para entender el comportamiento
		const isLongText = text.length > 50;
		const isNumberText = /^\d+[\d.,]*$/.test(text.trim()); // Detectar números como precios
		const shouldDebug = isLongText || isNumberText || text.includes('349') || text.includes('999'); // Debug específico para este caso
		
		if (shouldDebug) {
			console.log(`🔍 [AUTOFIT RECALC] "${text}":`, {
				textLength: text.length,
				isNumberText,
				containerWidth,
				containerHeight,
				baseFontSize,
				currentFitted: fittedFontSize,
				containerElement: container,
				measuringElement: measurer
			});
		}

		// Establish initial guess and bounds
		const startFont = typeof baseFontSize === 'number'
			? baseFontSize
			: (typeof style.fontSize === 'number'
				? (style.fontSize as number)
				: (typeof style.fontSize === 'string' && style.fontSize.endsWith('px')
					? parseFloat(style.fontSize as string)
					: fittedFontSize));

		let low = Math.max(minFontSize, 1);
		let high = Math.max(startFont, minFontSize);

		// If starting font doesn't fit, we need to shrink - set high to starting font
		if (!fitsIn(high, containerWidth, containerHeight, measurer)) {
			// Text is too big, we need to shrink
			// Keep high as startFont and low as minFontSize for binary search
			if (shouldDebug) {
				console.log(`🔍 [AUTOFIT] "${text}" - SHRINKING from ${high}px`);
			}
		} else {
			// Text fits, try to expand upwards to find an upper bound
			// 🎯 MEJORAR: Ser más agresivo en la expansión
			const hardCap = Math.max(
				maxFontSize || 0,
				Math.floor(containerHeight * 0.9) // Usar 90% de la altura como límite más realista
			) || Math.floor(containerHeight * 0.9);

			if (shouldDebug) {
				console.log(`🔍 [AUTOFIT] "${text}" - EXPANDING from ${high}px, hardCap: ${hardCap}px`);
			}

			// 🎯 ESTRATEGIA MÁS AGRESIVA: Intentar primero con el tamaño original
			let expansionAttempts = 0;
			while (high < hardCap && fitsIn(high, containerWidth, containerHeight, measurer) && expansionAttempts < 20) {
				low = high; // we know it fits at least this
				high = Math.min(hardCap, Math.floor(high * 1.15) + 1); // Incremento más gradual
				expansionAttempts++;
				
				if (shouldDebug) {
					console.log(`🔍 [AUTOFIT] Expansion attempt ${expansionAttempts}: trying ${high}px`);
				}
				
				if (high === low) break;
			}
		}

		let best = low;
		let iterations = 0;
		while (low <= high && iterations < maxIterations) {
			iterations += 1;
			const mid = Math.floor((low + high) / 2);
			if (fitsIn(mid, containerWidth, containerHeight, measurer)) {
				best = mid;
				low = mid + 1; // try bigger until it breaks
			} else {
				high = mid - 1; // too big → shrink
			}
		}

		if (shouldDebug) {
			console.log(`✅ [AUTOFIT RESULT] "${text}": ${best}px (was ${fittedFontSize}px)`, {
				originalBaseFontSize: baseFontSize,
				finalFontSize: best,
				containerDimensions: `${containerWidth}x${containerHeight}`,
				textFits: fitsIn(best, containerWidth, containerHeight, measurer),
				couldBeBigger: fitsIn(best + 10, containerWidth, containerHeight, measurer),
				couldBeMuchBigger: fitsIn(best + 50, containerWidth, containerHeight, measurer)
			});
		}
		setFittedFontSize(best);
	};

	// Recalculate synchronously after DOM updates to avoid flicker
	useLayoutEffect(() => {
		recalc();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [text, style.fontFamily, style.fontWeight, style.lineHeight, style.letterSpacing, style.whiteSpace]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const ro = new ResizeObserver(() => recalc());
		ro.observe(container);
		return () => ro.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div ref={containerRef} className={className} style={{ position: 'relative', ...style, fontSize: `${fittedFontSize}px`, overflow: 'hidden' }}>
			{/* Measurer element */}
			<div ref={measurerRef} style={measuringStyle} aria-hidden />
			<div style={{ 
				display: 'flex', 
				alignItems: 'center', 
				justifyContent: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start',
				width: '100%', 
				height: '100%', 
				whiteSpace: 'pre-wrap', 
				wordBreak: 'break-word',
				// 🎯 USAR EL MISMO LINEHEIGHT OPTIMIZADO QUE EL MEASURER
				lineHeight: '1.0' // Consistente con el measurer
			}}>
				{text}
			</div>
		</div>
	);
};

export default AutoFitText;
