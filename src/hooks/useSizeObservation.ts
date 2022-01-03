/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react'
import throttle from 'lodash.throttle'


interface Size {
    width: number
    height: number
}

export function useSizeObservation(init?: Partial<Size & { onHeightChange: (height: number) => void }>): Size & { ref: React.RefObject<HTMLDivElement> } {

    const ref = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState<Size>({
        width: init?.width ?? 0,
        height: init?.height ?? 0
    })

    const onSizeChange = throttle((entries: ResizeObserverEntry[]) => {
        if (!entries || entries.length < 1) return
        const newWidth = entries[0].target.clientWidth
        const newHeight = entries[0].target.clientHeight
        if (size.width === newWidth && size.height === newHeight) return
        setSize({
            width: newWidth,
            height: newHeight
        })
    }, 100)

    useEffect(() => {
        init?.onHeightChange?.(size.height)
    }, [size.height])

    useEffect(() => {
        if (!ref.current) return
        const observer = new ResizeObserver(onSizeChange)
        observer.observe(ref.current)
        return () => {
            observer.disconnect()
        }
    }, [ref.current])

    return {
        ref,
        height: size.height,
        width: size.width
    }

}