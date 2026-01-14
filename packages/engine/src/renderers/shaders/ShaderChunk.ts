import alphahash_fragment from './ShaderChunk/alphahash_fragment.glsl';
import alphahash_pars_fragment from './ShaderChunk/alphahash_pars_fragment.glsl';
import alphamap_fragment from './ShaderChunk/alphamap_fragment.glsl';
import alphamap_pars_fragment from './ShaderChunk/alphamap_pars_fragment.glsl';
import alphatest_fragment from './ShaderChunk/alphatest_fragment.glsl';
import alphatest_pars_fragment from './ShaderChunk/alphatest_pars_fragment.glsl';
import aomap_fragment from './ShaderChunk/aomap_fragment.glsl';
import aomap_pars_fragment from './ShaderChunk/aomap_pars_fragment.glsl';
import batching_pars_vertex from './ShaderChunk/batching_pars_vertex.glsl';
import batching_vertex from './ShaderChunk/batching_vertex.glsl';
import begin_vertex from './ShaderChunk/begin_vertex.glsl';
import beginnormal_vertex from './ShaderChunk/beginnormal_vertex.glsl';
import bsdfs from './ShaderChunk/bsdfs.glsl';
import iridescence_fragment from './ShaderChunk/iridescence_fragment.glsl';
import bumpmap_pars_fragment from './ShaderChunk/bumpmap_pars_fragment.glsl';
import clipping_planes_fragment from './ShaderChunk/clipping_planes_fragment.glsl';
import clipping_planes_pars_fragment from './ShaderChunk/clipping_planes_pars_fragment.glsl';
import clipping_planes_pars_vertex from './ShaderChunk/clipping_planes_pars_vertex.glsl';
import clipping_planes_vertex from './ShaderChunk/clipping_planes_vertex.glsl';
import color_fragment from './ShaderChunk/color_fragment.glsl';
import color_pars_fragment from './ShaderChunk/color_pars_fragment.glsl';
import color_pars_vertex from './ShaderChunk/color_pars_vertex.glsl';
import color_vertex from './ShaderChunk/color_vertex.glsl';
import common from './ShaderChunk/common.glsl';
import cube_uv_reflection_fragment from './ShaderChunk/cube_uv_reflection_fragment.glsl';
import defaultnormal_vertex from './ShaderChunk/defaultnormal_vertex.glsl';
import displacementmap_pars_vertex from './ShaderChunk/displacementmap_pars_vertex.glsl';
import displacementmap_vertex from './ShaderChunk/displacementmap_vertex.glsl';
import emissivemap_fragment from './ShaderChunk/emissivemap_fragment.glsl';
import emissivemap_pars_fragment from './ShaderChunk/emissivemap_pars_fragment.glsl';
import colorspace_fragment from './ShaderChunk/colorspace_fragment.glsl';
import colorspace_pars_fragment from './ShaderChunk/colorspace_pars_fragment.glsl';
import envmap_fragment from './ShaderChunk/envmap_fragment.glsl';
import envmap_common_pars_fragment from './ShaderChunk/envmap_common_pars_fragment.glsl';
import envmap_pars_fragment from './ShaderChunk/envmap_pars_fragment.glsl';
import envmap_pars_vertex from './ShaderChunk/envmap_pars_vertex.glsl';
import envmap_vertex from './ShaderChunk/envmap_vertex.glsl';
import fog_vertex from './ShaderChunk/fog_vertex.glsl';
import fog_pars_vertex from './ShaderChunk/fog_pars_vertex.glsl';
import fog_fragment from './ShaderChunk/fog_fragment.glsl';
import fog_pars_fragment from './ShaderChunk/fog_pars_fragment.glsl';
import gradientmap_pars_fragment from './ShaderChunk/gradientmap_pars_fragment.glsl';
import lightmap_pars_fragment from './ShaderChunk/lightmap_pars_fragment.glsl';
import lights_lambert_fragment from './ShaderChunk/lights_lambert_fragment.glsl';
import lights_lambert_pars_fragment from './ShaderChunk/lights_lambert_pars_fragment.glsl';
import lights_pars_begin from './ShaderChunk/lights_pars_begin.glsl';
import envmap_physical_pars_fragment from './ShaderChunk/envmap_physical_pars_fragment.glsl';
import lights_toon_fragment from './ShaderChunk/lights_toon_fragment.glsl';
import lights_toon_pars_fragment from './ShaderChunk/lights_toon_pars_fragment.glsl';
import lights_phong_fragment from './ShaderChunk/lights_phong_fragment.glsl';
import lights_phong_pars_fragment from './ShaderChunk/lights_phong_pars_fragment.glsl';
import lights_physical_fragment from './ShaderChunk/lights_physical_fragment.glsl';
import lights_physical_pars_fragment from './ShaderChunk/lights_physical_pars_fragment.glsl';
import lights_fragment_begin from './ShaderChunk/lights_fragment_begin.glsl';
import lights_fragment_maps from './ShaderChunk/lights_fragment_maps.glsl';
import lights_fragment_end from './ShaderChunk/lights_fragment_end.glsl';
import logdepthbuf_fragment from './ShaderChunk/logdepthbuf_fragment.glsl';
import logdepthbuf_pars_fragment from './ShaderChunk/logdepthbuf_pars_fragment.glsl';
import logdepthbuf_pars_vertex from './ShaderChunk/logdepthbuf_pars_vertex.glsl';
import logdepthbuf_vertex from './ShaderChunk/logdepthbuf_vertex.glsl';
import map_fragment from './ShaderChunk/map_fragment.glsl';
import map_pars_fragment from './ShaderChunk/map_pars_fragment.glsl';
import map_particle_fragment from './ShaderChunk/map_particle_fragment.glsl';
import map_particle_pars_fragment from './ShaderChunk/map_particle_pars_fragment.glsl';
import metalnessmap_fragment from './ShaderChunk/metalnessmap_fragment.glsl';
import metalnessmap_pars_fragment from './ShaderChunk/metalnessmap_pars_fragment.glsl';
import morphinstance_vertex from './ShaderChunk/morphinstance_vertex.glsl';
import morphcolor_vertex from './ShaderChunk/morphcolor_vertex.glsl';
import morphnormal_vertex from './ShaderChunk/morphnormal_vertex.glsl';
import morphtarget_pars_vertex from './ShaderChunk/morphtarget_pars_vertex.glsl';
import morphtarget_vertex from './ShaderChunk/morphtarget_vertex.glsl';
import normal_fragment_begin from './ShaderChunk/normal_fragment_begin.glsl';
import normal_fragment_maps from './ShaderChunk/normal_fragment_maps.glsl';
import normal_pars_fragment from './ShaderChunk/normal_pars_fragment.glsl';
import normal_pars_vertex from './ShaderChunk/normal_pars_vertex.glsl';
import normal_vertex from './ShaderChunk/normal_vertex.glsl';
import normalmap_pars_fragment from './ShaderChunk/normalmap_pars_fragment.glsl';
import clearcoat_normal_fragment_begin from './ShaderChunk/clearcoat_normal_fragment_begin.glsl';
import clearcoat_normal_fragment_maps from './ShaderChunk/clearcoat_normal_fragment_maps.glsl';
import clearcoat_pars_fragment from './ShaderChunk/clearcoat_pars_fragment.glsl';
import iridescence_pars_fragment from './ShaderChunk/iridescence_pars_fragment.glsl';
import opaque_fragment from './ShaderChunk/opaque_fragment.glsl';
import packing from './ShaderChunk/packing.glsl';
import premultiplied_alpha_fragment from './ShaderChunk/premultiplied_alpha_fragment.glsl';
import project_vertex from './ShaderChunk/project_vertex.glsl';
import dithering_fragment from './ShaderChunk/dithering_fragment.glsl';
import dithering_pars_fragment from './ShaderChunk/dithering_pars_fragment.glsl';
import roughnessmap_fragment from './ShaderChunk/roughnessmap_fragment.glsl';
import roughnessmap_pars_fragment from './ShaderChunk/roughnessmap_pars_fragment.glsl';
import shadowmap_pars_fragment from './ShaderChunk/shadowmap_pars_fragment.glsl';
import shadowmap_pars_vertex from './ShaderChunk/shadowmap_pars_vertex.glsl';
import shadowmap_vertex from './ShaderChunk/shadowmap_vertex.glsl';
import shadowmask_pars_fragment from './ShaderChunk/shadowmask_pars_fragment.glsl';
import skinbase_vertex from './ShaderChunk/skinbase_vertex.glsl';
import skinning_pars_vertex from './ShaderChunk/skinning_pars_vertex.glsl';
import skinning_vertex from './ShaderChunk/skinning_vertex.glsl';
import skinnormal_vertex from './ShaderChunk/skinnormal_vertex.glsl';
import specularmap_fragment from './ShaderChunk/specularmap_fragment.glsl';
import specularmap_pars_fragment from './ShaderChunk/specularmap_pars_fragment.glsl';
import tonemapping_fragment from './ShaderChunk/tonemapping_fragment.glsl';
import tonemapping_pars_fragment from './ShaderChunk/tonemapping_pars_fragment.glsl';
import transmission_fragment from './ShaderChunk/transmission_fragment.glsl';
import transmission_pars_fragment from './ShaderChunk/transmission_pars_fragment.glsl';
import uv_pars_fragment from './ShaderChunk/uv_pars_fragment.glsl';
import uv_pars_vertex from './ShaderChunk/uv_pars_vertex.glsl';
import uv_vertex from './ShaderChunk/uv_vertex.glsl';
import worldpos_vertex from './ShaderChunk/worldpos_vertex.glsl';

import * as background from './ShaderLib/background.glsl';
import * as backgroundCube from './ShaderLib/backgroundCube.glsl';
import * as cube from './ShaderLib/cube.glsl';
import * as depth from './ShaderLib/depth.glsl';
import * as distanceRGBA from './ShaderLib/distanceRGBA.glsl';
import * as equirect from './ShaderLib/equirect.glsl';
import * as linedashed from './ShaderLib/linedashed.glsl';
import * as meshbasic from './ShaderLib/meshbasic.glsl';
import * as meshlambert from './ShaderLib/meshlambert.glsl';
import * as meshmatcap from './ShaderLib/meshmatcap.glsl';
import * as meshnormal from './ShaderLib/meshnormal.glsl';
import * as meshphong from './ShaderLib/meshphong.glsl';
import * as meshphysical from './ShaderLib/meshphysical.glsl';
import * as meshtoon from './ShaderLib/meshtoon.glsl';
import * as points from './ShaderLib/points.glsl';
import * as shadow from './ShaderLib/shadow.glsl';
import * as sprite from './ShaderLib/sprite.glsl';

export const ShaderChunk = {
	alphahash_fragment: alphahash_fragment,
	alphahash_pars_fragment: alphahash_pars_fragment,
	alphamap_fragment: alphamap_fragment,
	alphamap_pars_fragment: alphamap_pars_fragment,
	alphatest_fragment: alphatest_fragment,
	alphatest_pars_fragment: alphatest_pars_fragment,
	aomap_fragment: aomap_fragment,
	aomap_pars_fragment: aomap_pars_fragment,
	batching_pars_vertex: batching_pars_vertex,
	batching_vertex: batching_vertex,
	begin_vertex: begin_vertex,
	beginnormal_vertex: beginnormal_vertex,
	bsdfs: bsdfs,
	iridescence_fragment: iridescence_fragment,
	bumpmap_pars_fragment: bumpmap_pars_fragment,
	clipping_planes_fragment: clipping_planes_fragment,
	clipping_planes_pars_fragment: clipping_planes_pars_fragment,
	clipping_planes_pars_vertex: clipping_planes_pars_vertex,
	clipping_planes_vertex: clipping_planes_vertex,
	color_fragment: color_fragment,
	color_pars_fragment: color_pars_fragment,
	color_pars_vertex: color_pars_vertex,
	color_vertex: color_vertex,
	common: common,
	cube_uv_reflection_fragment: cube_uv_reflection_fragment,
	defaultnormal_vertex: defaultnormal_vertex,
	displacementmap_pars_vertex: displacementmap_pars_vertex,
	displacementmap_vertex: displacementmap_vertex,
	emissivemap_fragment: emissivemap_fragment,
	emissivemap_pars_fragment: emissivemap_pars_fragment,
	colorspace_fragment: colorspace_fragment,
	colorspace_pars_fragment: colorspace_pars_fragment,
	envmap_fragment: envmap_fragment,
	envmap_common_pars_fragment: envmap_common_pars_fragment,
	envmap_pars_fragment: envmap_pars_fragment,
	envmap_pars_vertex: envmap_pars_vertex,
	envmap_physical_pars_fragment: envmap_physical_pars_fragment,
	envmap_vertex: envmap_vertex,
	fog_vertex: fog_vertex,
	fog_pars_vertex: fog_pars_vertex,
	fog_fragment: fog_fragment,
	fog_pars_fragment: fog_pars_fragment,
	gradientmap_pars_fragment: gradientmap_pars_fragment,
	lightmap_pars_fragment: lightmap_pars_fragment,
	lights_lambert_fragment: lights_lambert_fragment,
	lights_lambert_pars_fragment: lights_lambert_pars_fragment,
	lights_pars_begin: lights_pars_begin,
	lights_toon_fragment: lights_toon_fragment,
	lights_toon_pars_fragment: lights_toon_pars_fragment,
	lights_phong_fragment: lights_phong_fragment,
	lights_phong_pars_fragment: lights_phong_pars_fragment,
	lights_physical_fragment: lights_physical_fragment,
	lights_physical_pars_fragment: lights_physical_pars_fragment,
	lights_fragment_begin: lights_fragment_begin,
	lights_fragment_maps: lights_fragment_maps,
	lights_fragment_end: lights_fragment_end,
	logdepthbuf_fragment: logdepthbuf_fragment,
	logdepthbuf_pars_fragment: logdepthbuf_pars_fragment,
	logdepthbuf_pars_vertex: logdepthbuf_pars_vertex,
	logdepthbuf_vertex: logdepthbuf_vertex,
	map_fragment: map_fragment,
	map_pars_fragment: map_pars_fragment,
	map_particle_fragment: map_particle_fragment,
	map_particle_pars_fragment: map_particle_pars_fragment,
	metalnessmap_fragment: metalnessmap_fragment,
	metalnessmap_pars_fragment: metalnessmap_pars_fragment,
	morphinstance_vertex: morphinstance_vertex,
	morphcolor_vertex: morphcolor_vertex,
	morphnormal_vertex: morphnormal_vertex,
	morphtarget_pars_vertex: morphtarget_pars_vertex,
	morphtarget_vertex: morphtarget_vertex,
	normal_fragment_begin: normal_fragment_begin,
	normal_fragment_maps: normal_fragment_maps,
	normal_pars_fragment: normal_pars_fragment,
	normal_pars_vertex: normal_pars_vertex,
	normal_vertex: normal_vertex,
	normalmap_pars_fragment: normalmap_pars_fragment,
	clearcoat_normal_fragment_begin: clearcoat_normal_fragment_begin,
	clearcoat_normal_fragment_maps: clearcoat_normal_fragment_maps,
	clearcoat_pars_fragment: clearcoat_pars_fragment,
	iridescence_pars_fragment: iridescence_pars_fragment,
	opaque_fragment: opaque_fragment,
	packing: packing,
	premultiplied_alpha_fragment: premultiplied_alpha_fragment,
	project_vertex: project_vertex,
	dithering_fragment: dithering_fragment,
	dithering_pars_fragment: dithering_pars_fragment,
	roughnessmap_fragment: roughnessmap_fragment,
	roughnessmap_pars_fragment: roughnessmap_pars_fragment,
	shadowmap_pars_fragment: shadowmap_pars_fragment,
	shadowmap_pars_vertex: shadowmap_pars_vertex,
	shadowmap_vertex: shadowmap_vertex,
	shadowmask_pars_fragment: shadowmask_pars_fragment,
	skinbase_vertex: skinbase_vertex,
	skinning_pars_vertex: skinning_pars_vertex,
	skinning_vertex: skinning_vertex,
	skinnormal_vertex: skinnormal_vertex,
	specularmap_fragment: specularmap_fragment,
	specularmap_pars_fragment: specularmap_pars_fragment,
	tonemapping_fragment: tonemapping_fragment,
	tonemapping_pars_fragment: tonemapping_pars_fragment,
	transmission_fragment: transmission_fragment,
	transmission_pars_fragment: transmission_pars_fragment,
	uv_pars_fragment: uv_pars_fragment,
	uv_pars_vertex: uv_pars_vertex,
	uv_vertex: uv_vertex,
	worldpos_vertex: worldpos_vertex,

	background_vert: background.vertex,
	background_frag: background.fragment,
	backgroundCube_vert: backgroundCube.vertex,
	backgroundCube_frag: backgroundCube.fragment,
	cube_vert: cube.vertex,
	cube_frag: cube.fragment,
	depth_vert: depth.vertex,
	depth_frag: depth.fragment,
	distanceRGBA_vert: distanceRGBA.vertex,
	distanceRGBA_frag: distanceRGBA.fragment,
	equirect_vert: equirect.vertex,
	equirect_frag: equirect.fragment,
	linedashed_vert: linedashed.vertex,
	linedashed_frag: linedashed.fragment,
	meshbasic_vert: meshbasic.vertex,
	meshbasic_frag: meshbasic.fragment,
	meshlambert_vert: meshlambert.vertex,
	meshlambert_frag: meshlambert.fragment,
	meshmatcap_vert: meshmatcap.vertex,
	meshmatcap_frag: meshmatcap.fragment,
	meshnormal_vert: meshnormal.vertex,
	meshnormal_frag: meshnormal.fragment,
	meshphong_vert: meshphong.vertex,
	meshphong_frag: meshphong.fragment,
	meshphysical_vert: meshphysical.vertex,
	meshphysical_frag: meshphysical.fragment,
	meshtoon_vert: meshtoon.vertex,
	meshtoon_frag: meshtoon.fragment,
	points_vert: points.vertex,
	points_frag: points.fragment,
	shadow_vert: shadow.vertex,
	shadow_frag: shadow.fragment,
	sprite_vert: sprite.vertex,
	sprite_frag: sprite.fragment
};
