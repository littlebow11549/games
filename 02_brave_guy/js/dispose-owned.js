// Only for transient meshes whose geometry/materials are owned by that subtree.
// Shared character/atlas textures must keep their existing lifetime management.
export function disposeOwned(root) {
 if (!root) return;
 const geometries=new Set(), materials=new Set();
 root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [].concat(o.material||[]))materials.add(m);});
 for(const g of geometries)g.dispose();
 for(const m of materials)m.dispose();
 root.removeFromParent();
}
