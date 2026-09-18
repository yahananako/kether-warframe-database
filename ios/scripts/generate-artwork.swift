#!/usr/bin/env swift

import AppKit
import Foundation

enum ArtworkError: Error, CustomStringConvertible {
    case usage
    case sourceUnreadable(String)
    case canvasCreation(Int)
    case pngEncoding(String)

    var description: String {
        switch self {
        case .usage:
            return "用法：generate-artwork.swift <氏族 Logo> <Assets.xcassets>"
        case .sourceUnreadable(let path):
            return "無法讀取氏族 Logo：\(path)"
        case .canvasCreation(let size):
            return "無法建立 \(size) × \(size) 圖片畫布"
        case .pngEncoding(let path):
            return "無法輸出 PNG：\(path)"
        }
    }
}

func render(
    source: NSImage,
    canvasSize: Int,
    logoMaxSize: CGFloat,
    background: NSColor?,
    destination: URL
) throws {
    let hasAlpha = background == nil
    guard
        let bitmap = NSBitmapImageRep(
            bitmapDataPlanes: nil,
            pixelsWide: canvasSize,
            pixelsHigh: canvasSize,
            bitsPerSample: 8,
            samplesPerPixel: hasAlpha ? 4 : 3,
            hasAlpha: hasAlpha,
            isPlanar: false,
            colorSpaceName: .deviceRGB,
            bitmapFormat: [],
            bytesPerRow: 0,
            bitsPerPixel: 0
        ),
        let graphics = NSGraphicsContext(bitmapImageRep: bitmap)
    else {
        throw ArtworkError.canvasCreation(canvasSize)
    }

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = graphics
    graphics.imageInterpolation = .high

    let canvas = NSRect(x: 0, y: 0, width: canvasSize, height: canvasSize)
    (background ?? .clear).setFill()
    canvas.fill()

    let sourceSize = source.size
    let scale = min(logoMaxSize / sourceSize.width, logoMaxSize / sourceSize.height)
    let drawSize = NSSize(width: sourceSize.width * scale, height: sourceSize.height * scale)
    let drawRect = NSRect(
        x: (CGFloat(canvasSize) - drawSize.width) / 2,
        y: (CGFloat(canvasSize) - drawSize.height) / 2,
        width: drawSize.width,
        height: drawSize.height
    )
    source.draw(
        in: drawRect,
        from: .zero,
        operation: .sourceOver,
        fraction: 1,
        respectFlipped: true,
        hints: [.interpolation: NSImageInterpolation.high]
    )
    graphics.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()

    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        throw ArtworkError.pngEncoding(destination.path)
    }
    try FileManager.default.createDirectory(
        at: destination.deletingLastPathComponent(),
        withIntermediateDirectories: true
    )
    try data.write(to: destination, options: .atomic)
}

func main() throws {
    guard CommandLine.arguments.count == 3 else { throw ArtworkError.usage }
    let sourcePath = CommandLine.arguments[1]
    let assetRoot = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
    guard let source = NSImage(contentsOfFile: sourcePath), source.size.width > 0, source.size.height > 0 else {
        throw ArtworkError.sourceUnreadable(sourcePath)
    }

    let appIcon = assetRoot
        .appendingPathComponent("AppIcon.appiconset", isDirectory: true)
        .appendingPathComponent("AppIcon.png")
    try render(
        source: source,
        canvasSize: 1024,
        logoMaxSize: 760,
        background: NSColor(srgbRed: 9 / 255, green: 11 / 255, blue: 18 / 255, alpha: 1),
        destination: appIcon
    )

    let logoSet = assetRoot.appendingPathComponent("KetherLogo.imageset", isDirectory: true)
    for (size, name) in [
        (128, "KetherLogo.png"),
        (256, "KetherLogo@2x.png"),
        (384, "KetherLogo@3x.png")
    ] {
        try render(
            source: source,
            canvasSize: size,
            logoMaxSize: CGFloat(size) * 0.9375,
            background: nil,
            destination: logoSet.appendingPathComponent(name)
        )
    }

    print("KETHER iOS 圖像資產已生成")
}

do {
    try main()
} catch {
    fputs("\(error)\n", stderr)
    exit(1)
}
