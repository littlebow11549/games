"""Repack the approved playable Little Angel as a low-cost skinned shoulder companion."""
import argparse
import io
from pathlib import Path

import numpy as np
from PIL import Image

from make_game02_ganqiao_motion import add, get, glb, load
from make_game02_kaban_lod import simplify

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "02_brave_guy/assets/runtime/stage-art"
SOURCE = ASSETS / "brave_guy_charactor02_angel_motion.glb"
DEST = ASSETS / "brave_guy_charactor02_angel_companion.glb"


def companion(raw, target):
    src, buf = load(raw)
    prim = src["meshes"][0]["primitives"][0]
    attrs = prim["attributes"]
    p, n, uv, ids, weights = [get(src, buf, attrs[k]) for k in
                              ("POSITION", "NORMAL", "TEXCOORD_0", "JOINTS_0", "WEIGHTS_0")]
    faces = get(src, buf, prim["indices"]).reshape(-1, 3).astype("int32")
    skin = dict(src["skins"][0])
    selected, indices = simplify(p, uv, n, faces, weights, ids, len(skin["joints"]), target)

    # Keep one rig, one draw, and one reduced, high-quality color texture.
    # Seam vertices, original UVs and the painted face/bells/white wings remain intact.
    mat = {"name": "Little Angel companion colors", "extensions": {"KHR_materials_unlit": {}},
           "pbrMetallicRoughness": {"baseColorTexture": {"index": 0}, "metallicFactor": 0, "roughnessFactor": 1}}
    j = dict(asset={"version": "2.0", "generator": "Brave Guy Little Angel companion repack"},
             extensionsUsed=["KHR_materials_unlit"], accessors=[], buffers=[{"byteLength": 0}],
             bufferViews=[], scenes=src["scenes"], scene=src["scene"], nodes=src["nodes"],
             skins=[skin], materials=[mat], textures=src["textures"], samplers=src["samplers"],
             images=[], extras={"sourceRole": "angel_playable", "role": "angel_companion"})
    out = bytearray()
    new_attrs = {}
    for name, arr, dtype, kind in [
            ("POSITION", p, "<f4", "VEC3"), ("NORMAL", n, "<f4", "VEC3"),
            ("TEXCOORD_0", uv, "<f4", "VEC2"), ("JOINTS_0", ids, "<u2", "VEC4"),
            ("WEIGHTS_0", weights, "<f4", "VEC4")]:
        new_attrs[name] = add(j, out, arr[selected].astype(dtype), kind, 34962, limits=name == "POSITION")
    j["meshes"] = [{"name": "Little Angel companion", "primitives": [
        {"attributes": new_attrs, "indices": add(j, out, indices.astype("<u2"), "SCALAR", 34963), "material": 0}
    ]}]
    skin["inverseBindMatrices"] = add(j, out, get(src, buf, skin["inverseBindMatrices"]).astype("<f4"), "MAT4")
    view = src["bufferViews"][src["images"][0]["bufferView"]]
    start = view.get("byteOffset", 0)
    im = Image.open(io.BytesIO(buf[start:start + view["byteLength"]])).convert("RGB")
    im.thumbnail((768, 768), Image.Resampling.LANCZOS)
    encoded = io.BytesIO()
    im.save(encoded, format="JPEG", quality=91, subsampling=0, optimize=True)
    out.extend(b"\0" * (-len(out) % 4))
    j["images"].append({"mimeType": "image/jpeg", "bufferView": len(j["bufferViews"])})
    j["bufferViews"].append({"buffer": 0, "byteOffset": len(out), "byteLength": len(encoded.getvalue())})
    out.extend(encoded.getvalue())

    idle = next(a for a in src["animations"] if a["name"] == "Angel_Idle")
    anim = {"name": "Angel_Idle", "channels": [], "samplers": []}
    j["animations"] = [anim]
    time_cache = {}
    for ch in idle["channels"]:
        # The playable-only skirt morphs are not needed at the companion's idle scale.
        if ch["target"]["path"] == "weights":
            continue
        source = idle["samplers"][ch["sampler"]]
        t = get(src, buf, source["input"])
        keys = np.unique(np.r_[np.arange(0, len(t), 3), len(t) - 1])
        time_id = source["input"]
        if time_id not in time_cache:
            time_cache[time_id] = add(j, out, t[keys].astype("<f4"), "SCALAR", limits=True)
        value = get(src, buf, source["output"])
        output = add(j, out, value[keys].astype("<f4"), src["accessors"][source["output"]]["type"])
        anim["channels"].append({"sampler": len(anim["samplers"]), "target": ch["target"]})
        anim["samplers"].append({"input": time_cache[time_id], "output": output, "interpolation": "LINEAR"})
    print(f"Little Angel: {len(faces)} -> {len(indices)//3} triangles; texture {im.width}x{im.height}")
    return glb(j, out)


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--source", type=Path, default=SOURCE)
    cli.add_argument("--output", type=Path, default=DEST)
    cli.add_argument("--triangles", type=int, default=6500)
    args = cli.parse_args()
    args.output.write_bytes(companion(args.source.read_bytes(), args.triangles))
    print(f"{args.output.stat().st_size} bytes: {args.output}")
