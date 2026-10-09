"""Cuts the CV's face from the variable ABC Areal.

The PDF engine embeds static faces, so this pins the variable font at Semi
Mono 400. The engine also reads kerning only from plain pair-positioning
lookups, and the font keeps most of its pairs inside Extension lookups, so the
CV's copy keeps just the kerning lookups, unwrapped. Glyphs and kerning values
are untouched; mark positioning, which the engine ignores, is left out.

The one change to the face is its space, a tenth of an em narrower. The Semi
Mono space is nearly as wide as a letter, which opens gaps between words at the
CV's size. The engine's word spacing would reach only the ordinary space; set
in the face, it reaches the no-break space too, which shares the glyph, so the
words the CV holds together keep the same gaps as the rest.

    python3 apps/web/scripts/cv-font.py [variable font]
"""

import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / 'packages/base/app/assets/fonts/ABCArealSuperfamilyVariable.woff2'
TARGET = ROOT / 'apps/web/server/assets/fonts/ABCArealSemiMonoRegular.ttf'
AXES = {'MONO': 50, 'wght': 400, 'slnt': 0, 'DRKM': 0}
SPACE_ADJUST = -0.1


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


def narrow_space(font: TTFont) -> None:
    glyph = font.getBestCmap()[ord(' ')]
    advance, lsb = font['hmtx'][glyph]
    font['hmtx'][glyph] = (advance + round(SPACE_ADJUST * font['head'].unitsPerEm), lsb)


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE
    font = instantiateVariableFont(TTFont(source), AXES)
    keep_kerning(font)
    narrow_space(font)
    font.flavor = None
    font.save(TARGET)

    cut = TTFont(TARGET)
    lookups = [lookup.LookupType for lookup in cut['GPOS'].table.LookupList.Lookup]
    if any(kind != 2 for kind in lookups):
        sys.exit(f'Kerning did not fit in plain lookups: {lookups}')
    cmap = cut.getBestCmap()
    if cmap.get(0xA0) != cmap[ord(' ')]:
        sys.exit('The no-break space no longer shares the space glyph')
    print(f'Wrote {TARGET.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
