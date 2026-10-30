"""Cuts the CV's face from the variable Mirage.

The PDF engine embeds static TrueType faces, so this pins the variable font
at weight 400 and the optical size of the CV's text. The engine reads kerning
only from plain pair-positioning lookups, and the font keeps its pairs inside
Extension lookups, so the CV's copy keeps just the kerning lookups, unwrapped.
It reads no stylistic sets either, so the two the site turns on, ss02 for
square quotes and punctuation and cv04, are written into the character map:
each character that has an alternate in them maps to the alternate. Glyphs
and kerning values are untouched; mark positioning, which the engine
ignores, is left out.

    python3 apps/personal/scripts/cv-font.py [variable font]
"""

import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[3]
SOURCE = Path.home() / 'Library/Fonts/Mirage-Variable.ttf'
TARGET = ROOT / 'apps/personal/server/assets/fonts/Mirage.ttf'
AXES = {'wght': 400, 'opsz': 9, 'wdth': 100}
FEATURES = ['ss02', 'cv04']


def keep_kerning(font: TTFont) -> None:
    gpos = font['GPOS'].table
    kern = [r for r in gpos.FeatureList.FeatureRecord if r.FeatureTag == 'kern']
    indices = sorted({i for r in kern for i in r.Feature.LookupListIndex})
    lookups = [gpos.LookupList.Lookup[i] for i in indices]
    for lookup in lookups:
        if lookup.LookupType == 9:
            lookup.SubTable = [sub.ExtSubTable for sub in lookup.SubTable]
            lookup.LookupType = lookup.SubTable[0].LookupType
    gpos.LookupList.Lookup = lookups
    gpos.LookupList.LookupCount = len(lookups)

    lookup_index = {old: new for new, old in enumerate(indices)}
    feature_index = {
        old: new
        for new, old in enumerate(
            i for i, r in enumerate(gpos.FeatureList.FeatureRecord) if r.FeatureTag == 'kern'
        )
    }
    for record in kern:
        record.Feature.LookupListIndex = [lookup_index[i] for i in record.Feature.LookupListIndex]
        record.Feature.LookupCount = len(record.Feature.LookupListIndex)
    gpos.FeatureList.FeatureRecord = kern
    gpos.FeatureList.FeatureCount = len(kern)

    for script in gpos.ScriptList.ScriptRecord:
        systems = [script.Script.DefaultLangSys] + [r.LangSys for r in script.Script.LangSysRecord]
        for system in filter(None, systems):
            system.FeatureIndex = [feature_index[i] for i in system.FeatureIndex if i in feature_index]
            system.FeatureCount = len(system.FeatureIndex)


def substitutions(font: TTFont, tag: str) -> dict[str, str]:
    gsub = font['GSUB'].table
    records = [r for r in gsub.FeatureList.FeatureRecord if r.FeatureTag == tag]
    mapping: dict[str, str] = {}
    for index in sorted({i for r in records for i in r.Feature.LookupListIndex}):
        for subtable in gsub.LookupList.Lookup[index].SubTable:
            subtable = getattr(subtable, 'ExtSubTable', subtable)
            if not hasattr(subtable, 'mapping'):
                sys.exit(f'{tag} is not a plain substitution')
            mapping.update(subtable.mapping)
    return mapping


def bake_features(font: TTFont) -> None:
    mapping: dict[str, str] = {}
    for tag in FEATURES:
        mapping.update(substitutions(font, tag))
    for table in font['cmap'].tables:
        for code, glyph in table.cmap.items():
            if glyph in mapping:
                table.cmap[code] = mapping[glyph]


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE
    font = instantiateVariableFont(TTFont(source), AXES)
    keep_kerning(font)
    bake_features(font)
    font.save(TARGET)

    cut = TTFont(TARGET)
    lookups = [lookup.LookupType for lookup in cut['GPOS'].table.LookupList.Lookup]
    if any(kind != 2 for kind in lookups):
        sys.exit(f'Kerning did not fit in plain lookups: {lookups}')
    if not cut.getBestCmap()[ord('g')].endswith('.cv04'):
        sys.exit('cv04 did not reach the character map')
    print(f'Wrote {TARGET.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
