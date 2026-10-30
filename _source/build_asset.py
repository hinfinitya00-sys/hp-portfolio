import bpy,json,math
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parent
out=root.parent/'assets/models';out.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for number,data in enumerate(json.loads((root/'terrain-source.json').read_text())):
 p=data['positions'];c=data['colors'];verts=[tuple(p[i:i+3]) for i in range(0,len(p),3)];faces=[(i,i+2,i+1) for i in range(0,len(verts),3)]
 mesh=bpy.data.meshes.new('TerrainMesh');mesh.from_pydata(verts,[],faces);mesh.update()
 obj=bpy.data.objects.new(f"Tsubasa_{data['name']}_{number}",mesh);bpy.context.collection.objects.link(obj)
 colors=mesh.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT');colors.data.foreach_set('color',[v for i in range(0,len(c),3) for v in (*c[i:i+3],1)])
 mat=bpy.data.materials.new(f"{data['name']}_{number}");mat.use_nodes=True;mat.diffuse_color=(*data['color'],1)
 bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=data['roughness'];attr=mat.node_tree.nodes.new('ShaderNodeVertexColor');attr.layer_name='Color';mat.node_tree.links.new(attr.outputs['Color'],bsdf.inputs['Base Color']);obj.data.materials.append(mat)
 bpy.context.view_layer.objects.active=obj;obj.select_set(True)
 # Merge duplicate vertices at seams to keep the download compact.
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=.00001);bpy.ops.object.mode_set(mode='OBJECT');obj.select_set(False)
bpy.ops.export_scene.gltf(filepath=str(out/'tsubasa-terrain.glb'),export_format='GLB',export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_animations=False,export_cameras=False,export_lights=False,export_apply=True)
# The source file is editable in the installed Blender app.
bpy.ops.wm.save_as_mainfile(filepath=str(root/'tsubasa-terrain.blend'))

print('COMPRESSED_ASSET_READY')
