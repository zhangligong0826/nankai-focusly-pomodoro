import zlib, struct, math, os

def make_png(size, path):
    cx = cy = size / 2.0
    r = size * 0.46  # 圆形半径
    rows = []
    for y in range(size):
        row = bytearray([0])  # filter type 0
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx*dx + dy*dy)
            r_, g_, b_, a_ = 0, 0, 0, 0  # 透明背景
            if dist <= r:
                # 番茄红色主体 #E74C3C
                r_, g_, b_, a_ = 0xE7, 0x4C, 0x3C, 255
                # 白色时钟指针：时针(竖直向上偏右) + 分针(向右)
                # 时针：从中心到上方，宽约 size*0.06
                if abs(dx) <= size*0.035 and -size*0.30 <= dy <= size*0.02:
                    r_, g_, b_ = 255, 255, 255
                # 分针：从中心到右方
                if abs(dy) <= size*0.035 and 0 <= dx <= size*0.28:
                    r_, g_, b_ = 255, 255, 255
                # 中心圆点
                if dist <= size*0.05:
                    r_, g_, b_ = 255, 255, 255
            row += bytes([r_, g_, b_, a_])
        rows.append(bytes(row))
    raw = b''.join(rows)

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        c += struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        return c

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', zlib.compress(raw, 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)
    print(f'generated {path} ({size}x{size}, {len(png)} bytes)')

os.makedirs('public', exist_ok=True)
make_png(192, 'public/pwa-192x192.png')
make_png(512, 'public/pwa-512x512.png')
