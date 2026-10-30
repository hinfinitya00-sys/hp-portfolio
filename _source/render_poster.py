import bpy, math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'tsubasa-terrain.blend'))
# Use the same photo-based surfaces as the web renderer.
for obj in bpy.context.scene.objects:
 if obj.type!='MESH':continue
 uv=obj.data.uv_layers.new(name='SurfaceUV')
 for poly in obj.data.polygons:
  for loop in poly.loop_indices:
   v=obj.data.vertices[obj.data.loops[loop].vertex_index].co
   uv.data[loop].uv=(v.x*.65,(v.z-v.y)*.65)
 for mat in obj.data.materials:
  kind='rough' if 'Concrete' in mat.name else 'grass' if 'VegetatedSlope' in mat.name else None
  if not kind:continue
  nodes=mat.node_tree.nodes;links=mat.node_tree.links;bsdf=nodes.get('Principled BSDF')
  color=nodes.new('ShaderNodeTexImage');color.image=bpy.data.images.load(str(root/'textures'/f'{kind}-color.jpg'));links.new(color.outputs['Color'],bsdf.inputs['Base Color'])
  normal=nodes.new('ShaderNodeTexImage');normal.image=bpy.data.images.load(str(root/'textures'/f'{kind}-normal.jpg'));normal.image.colorspace_settings.name='Non-Color'
  convert=nodes.new('ShaderNodeNormalMap');convert.inputs['Strength'].default_value=.3;links.new(normal.outputs['Color'],convert.inputs['Color']);links.new(convert.outputs['Normal'],bsdf.inputs['Normal'])
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.world.color=(.38,.42,.46)
bpy.ops.object.camera_add(location=(9,20,10));cam=bpy.context.object;cam.rotation_euler=(Vector((0,.8,3.1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=45;scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(-6,6,12));light=bpy.context.object;light.data.energy=2200;light.data.shape='DISK';light.data.size=7;light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.light_add(type='AREA',location=(5,-5,9));light=bpy.context.object;light.data.energy=1200;light.data.size=6;light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'terrain-poster.png');bpy.ops.render.render(write_still=True)
