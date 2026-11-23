"""Render the original contribution cells from Platane/snk SVGs without animation."""

from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET


SVG = 'http://www.w3.org/2000/svg'
ET.register_namespace('', SVG)


def generate(source: Path, target: Path) -> None:
    original = ET.parse(source).getroot()
    css = ''.join(node.text or '' for node in original.findall(f'{{{SVG}}}style'))
    palette = dict(re.findall(r'--(c[0-4]|cb):([^;}]+)', css))
    levels = dict(re.findall(r'\.c\.([\w-]+)\{fill:var\(--(c[0-4])\)', css))
    cell_style = re.search(r'\.c\{([^}]+)\}', css)
    if not cell_style or not all(f'c{level}' in palette for level in range(5)):
        raise ValueError(f'Unsupported contribution SVG style: {source}')
    dimensions = dict(re.findall(r'(width|height):([\d.]+)px', cell_style[1]))
    if len(dimensions) != 2:
        raise ValueError(f'Missing cell dimensions: {source}')

    graph = ET.Element(f'{{{SVG}}}svg', {**original.attrib, 'role': 'img'})
    ET.SubElement(graph, f'{{{SVG}}}title').text = 'GitHub contribution graph'
    ET.SubElement(graph, f'{{{SVG}}}desc').text = 'Daily contributions, from less to more.'
    cells = []
    for cell in original.iter(f'{{{SVG}}}rect'):
        classes = cell.get('class', '').split()
        if 'c' not in classes:
            continue
        level = 'c0'
        for class_name in classes:
            if class_name == 'c':
                continue
            if class_name not in levels:
                raise ValueError(f'Unknown contribution cell class: {class_name}')
            level = levels[class_name]
        attrs = {key: cell.attrib[key] for key in ('x', 'y', 'rx', 'ry') if key in cell.attrib}
        attrs.update(dimensions, fill=palette[level], stroke=palette.get('cb', 'none'))
        cells.append(ET.SubElement(graph, f'{{{SVG}}}rect', attrs))
    if not cells:
        raise ValueError(f'No contribution cells: {source}')

    # Use the space below the grid for the contribution intensity legend.
    right = max(float(cell.get('x', '0')) + float(cell.get('width', '0')) for cell in cells)
    bottom = max(float(cell.get('y', '0')) + float(cell.get('height', '0')) for cell in cells)
    text_color = '#9198a1' if 'dark' in source.stem else '#59636e'
    for label, x in [('Less', right - 156), ('More', right - 32)]:
        ET.SubElement(graph, f'{{{SVG}}}text', {
            'x': str(x), 'y': str(bottom + 34), 'fill': text_color,
            'font-family': 'Arial, sans-serif', 'font-size': '11',
        }).text = label
    for level in range(5):
        ET.SubElement(graph, f'{{{SVG}}}rect', {
            'x': str(right - 120 + level * 16), 'y': str(bottom + 24),
            'width': '12', 'height': '12', 'rx': '2', 'fill': palette[f'c{level}'],
        })
    ET.ElementTree(graph).write(target, encoding='utf-8', xml_declaration=True)
    print(f'{source.name} -> {target.name}: {len(cells)} contribution cells')


if __name__ == '__main__':
    directory = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('dist')
    for suffix in ('', '-dark'):
        generate(directory / f'github-snake{suffix}.svg', directory / f'github-contributions{suffix}.svg')
