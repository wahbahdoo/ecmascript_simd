#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <math.h>
#include <time.h>
#include <emmintrin.h>
#include <stdint.h>

#define WIDTH        256
#define HEIGHT       256
#define NSUBSAMPLES  2
#define NAO_SAMPLES  8

typedef struct _vec
{
    float x;
    float y;
    float z;
} vec;

typedef struct _Isect
{
    float t;
    vec    p;
    vec    n;
    int    hit; 
} Isect;

typedef struct _Sphere
{
    vec    center;
    float radius;

} Sphere;

typedef struct _Plane
{
    vec    p;
    vec    n;

} Plane;

typedef struct _Ray
{
    vec    org;
    vec    dir;
} Ray;

Sphere spheres[3];
Plane  plane;

float rands1_init[] = { 0.1352356830611825,  0.288015044759959,   0.7678821850568056,  0.2686317905317992, 
                        0.3331136927008629,  0.8684257145505399,  0.781927386065945,   0.5896540696267039, 
                        0.44623699225485325, 0.9686877066269517,  0.07219804194755852, 0.32867410429753363, 
                        0.25455036014318466, 0.6900878311134875,  0.32115139183588326, 0.8623794671148062, 
                        0.41069260938093066, 0.999176808167249,   0.31144002149812877, 0.21190544497221708, 
                        0.589751492254436,   0.618399447761476,   0.7838233797810972,  0.22662024036981165, 
                        0.5274769144598395,  0.8913978524506092,  0.2461202829144895,  0.575232774252072, 
                        0.20723191439174116, 0.15211533522233367, 0.5140219402965158,  0.695398824987933, 
                        0.7201623972505331,  0.1737971710972488,  0.3138047114480287,  0.09142904286272824, 
                        0.15824169223196805, 0.11588017432950437, 0.4076798539608717,  0.06385629274882376, 
                        0.9907234299462289,  0.1742915315553546,  0.9236432255711406,  0.8344372694846243, 
                        0.05793144227936864, 0.35464465571567416, 0.3937969475518912,  0.8209003841038793, 
                        0.6443945677019656,  0.15443599177524447, 0.8957053178455681,  0.4145913925021887, 
                        0.4667414356954396,  0.42764953384175897, 0.03486692951992154, 0.13391495239920914, 
                        0.6122364429756999,  0.7934473238419741,  0.13505113637074828, 0.7279673060402274, 
                        0.3638722419273108,  0.30750402715057135, 0.8705337035935372,  0.3060465627349913   };

float rands2_init[] = { 0.6100146626122296,  0.8141843967605382,  0.7538463387172669,  0.538857217412442, 
                        0.7884696905966848,  0.2656198723707348,  0.3280213042162359,  0.25133296218700707, 
                        0.18718935316428542, 0.7374026740435511,  0.8333564973436296,  0.22081619454547763, 
                        0.08140448946505785, 0.7737920694053173,  0.9531879865098745,  0.385226191021502, 
                        0.8437968089710921,  0.45293551217764616, 0.11351405014283955, 0.6402874339837581, 
                        0.9657228307332844,  0.5241556512191892,  0.9501411342062056,  0.7991736396215856, 
                        0.7572617880068719,  0.6777111298870295,  0.19950113398954272, 0.09956562682054937, 
                        0.03746219468303025, 0.18719390942715108, 0.1519025124143809,  0.8241845818702132, 
                        0.9609565436840057,  0.7231316142715514,  0.26712060417048633, 0.7414182834327221, 
                        0.4706993775907904,  0.9619642498437315,  0.14598079677671194, 0.1517641346435994, 
                        0.5583144023548812,  0.7664180144201964,  0.8109071112703532,  0.4008640209212899, 
                        0.10891564912162721, 0.8558103002142161,  0.03816548571921885, 0.4263107746373862, 
                        0.280488790711388,   0.915016517508775,   0.8379701666999608,  0.5821647725533694, 
                        0.3671900019980967,  0.6120628621429205,  0.5861144624650478,  0.5639409353025258, 
                        0.4884668991435319,  0.9718172331340611,  0.4438377188052982,  0.9853541473858058, 
                        0.021908782655373216,0.6144221667200327,  0.11301262397319078, 0.17565111187286675  };

float rands1[64];
float rands2[64];

Isect isect; 


#define SIGNMASK _mm_castsi128_ps(_mm_set1_epi32(0x80000000))
#define _MM_NEGATE_(v) (_mm_xor_ps(v, SIGNMASK))
#define _MM_ABSVAL_(v) (_mm_andnot_ps(SIGNMASK, v))

static float vdot(vec v0, vec v1)
{
    return v0.x * v1.x + v0.y * v1.y + v0.z * v1.z;
}

static void vcross(vec *c, vec v0, vec v1)
{
    
    c->x = v0.y * v1.z - v0.z * v1.y;
    c->y = v0.z * v1.x - v0.x * v1.z;
    c->z = v0.x * v1.y - v0.y * v1.x;
}

static void vnormalize(vec *c)
{
    float length = sqrt(vdot((*c), (*c)));

    if (fabs(length) > 1.0e-17) {
        c->x /= length;
        c->y /= length;
        c->z /= length;
    }
}

static inline void
ray_sphere_intersect_simd(__m128 *t, __m128 *hit,
                          __m128 *px, __m128 *py, __m128 *pz,
                          __m128 *nx, __m128 *ny, __m128 *nz,
                          const __m128 dirx, const __m128 diry, const __m128 dirz,
                          const __m128 orgx, const __m128 orgy, const __m128 orgz,
                          const Sphere *sphere)
{
    __m128 rsx = _mm_sub_ps(orgx, _mm_set1_ps(sphere->center.x));
    __m128 rsy = _mm_sub_ps(orgy, _mm_set1_ps(sphere->center.y));
    __m128 rsz = _mm_sub_ps(orgz, _mm_set1_ps(sphere->center.z));
    
    __m128 B = _mm_add_ps(_mm_mul_ps(rsx, dirx), 
                          _mm_add_ps(_mm_mul_ps(rsy, diry), _mm_mul_ps(rsz, dirz)));
    __m128 C = _mm_sub_ps(_mm_add_ps(_mm_mul_ps(rsx, rsx), 
                                     _mm_add_ps(_mm_mul_ps(rsy, rsy), _mm_mul_ps(rsz, rsz))),
                          _mm_set1_ps(sphere->radius * sphere->radius));
    __m128 D = _mm_sub_ps(_mm_mul_ps(B, B), C);
    
    
    __m128 cond1 = _mm_cmpgt_ps(D, _mm_set1_ps(0.0));
    if (_mm_movemask_ps(cond1)) {
        __m128 t2 = _mm_sub_ps(_MM_NEGATE_(B), _mm_sqrt_ps(D));
        __m128 cond2 = _mm_and_ps(_mm_cmpgt_ps(t2, _mm_set1_ps(0.0)), _mm_cmplt_ps(t2, *t));
        if (_mm_movemask_ps(cond2)) {
            *t = _mm_or_ps(_mm_and_ps(cond2, t2), _mm_andnot_ps(cond2, *t));
            *hit = _mm_or_ps(cond2, *hit);
            
            *px = _mm_or_ps(_mm_and_ps(cond2, _mm_add_ps(orgx, _mm_mul_ps(dirx, *t))), 
                            _mm_andnot_ps(cond2, *px));
            *py = _mm_or_ps(_mm_and_ps(cond2, _mm_add_ps(orgy, _mm_mul_ps(diry, *t))), 
                            _mm_andnot_ps(cond2, *py));
            *pz = _mm_or_ps(_mm_and_ps(cond2, _mm_add_ps(orgz, _mm_mul_ps(dirz, *t))), 
                            _mm_andnot_ps(cond2, *pz));
                            
            *nx = _mm_or_ps(_mm_and_ps(cond2, _mm_sub_ps(*px, _mm_set1_ps(sphere->center.x))), 
                            _mm_andnot_ps(cond2, *nx));
            *ny = _mm_or_ps(_mm_and_ps(cond2, _mm_sub_ps(*py, _mm_set1_ps(sphere->center.y))), 
                            _mm_andnot_ps(cond2, *ny));
            *nz = _mm_or_ps(_mm_and_ps(cond2, _mm_sub_ps(*pz, _mm_set1_ps(sphere->center.z))), 
                            _mm_andnot_ps(cond2, *nz));
                            
            __m128 lengths = _mm_sqrt_ps(_mm_add_ps(_mm_mul_ps(*nx, *nx),
                                                    _mm_add_ps(_mm_mul_ps(*ny, *ny), 
                                                               _mm_mul_ps(*nz, *nz))));
            __m128 cond3 = _mm_cmpgt_ps(_MM_ABSVAL_(lengths), _mm_set1_ps(1.0e-17));
            *nx = _mm_or_ps(_mm_and_ps(cond3, _mm_div_ps(*nx, lengths)), _mm_andnot_ps(cond3, *nx));
            *ny = _mm_or_ps(_mm_and_ps(cond3, _mm_div_ps(*ny, lengths)), _mm_andnot_ps(cond3, *ny));
            *nz = _mm_or_ps(_mm_and_ps(cond3, _mm_div_ps(*nz, lengths)), _mm_andnot_ps(cond3, *nz));
        }
    }
}


static inline void
ray_plane_intersect_simd(__m128 *t, __m128 *hit,
                         __m128 *px, __m128 *py, __m128 *pz,
                         __m128 *nx, __m128 *ny, __m128 *nz,
                         const __m128 dirx, const __m128 diry, const __m128 dirz,
                         const __m128 orgx, const __m128 orgy, const __m128 orgz,
                         const Plane *plane)
{
    __m128 d = _MM_NEGATE_(_mm_add_ps(_mm_mul_ps(_mm_set1_ps(plane->p.x), _mm_set1_ps(plane->n.x)), 
                                      _mm_add_ps(_mm_mul_ps(_mm_set1_ps(plane->p.y), 
                                                            _mm_set1_ps(plane->n.y)), 
                                                 _mm_mul_ps(_mm_set1_ps(plane->p.z), 
                                                            _mm_set1_ps(plane->n.z)))));
    __m128 v = _mm_add_ps(_mm_mul_ps(dirx, _mm_set1_ps(plane->n.x)), 
                          _mm_add_ps(_mm_mul_ps(diry, _mm_set1_ps(plane->n.y)), 
                                     _mm_mul_ps(dirz, _mm_set1_ps(plane->n.z))));
    
    __m128 cond1 = _mm_cmpgt_ps(_MM_ABSVAL_(v), _mm_set1_ps(1.0e-17));
    __m128 dp = _mm_add_ps(_mm_mul_ps(orgx, _mm_set1_ps(plane->n.x)), 
                           _mm_add_ps(_mm_mul_ps(orgy, _mm_set1_ps(plane->n.y)), 
                                      _mm_mul_ps(orgz, _mm_set1_ps(plane->n.z))));
    __m128 t2 = _mm_and_ps(cond1, _mm_div_ps(_MM_NEGATE_(_mm_add_ps(dp, d)), v));
    __m128 cond2 = _mm_and_ps(_mm_cmpgt_ps(t2, _mm_set1_ps(0.0)), _mm_cmplt_ps(t2, *t));
    if (_mm_movemask_ps(cond2)) {
        *t = _mm_or_ps(_mm_and_ps(cond2, t2), _mm_andnot_ps(cond2, *t));
        *hit = _mm_or_ps(cond2, *hit);
        
        *px = _mm_or_ps(_mm_and_ps(cond2, _mm_add_ps(orgx, _mm_mul_ps(dirx, *t))), 
                        _mm_andnot_ps(cond2, *px));
        *py = _mm_or_ps(_mm_and_ps(cond2, _mm_add_ps(orgy, _mm_mul_ps(diry, *t))), 
                        _mm_andnot_ps(cond2, *py));
        *pz = _mm_or_ps(_mm_and_ps(cond2, _mm_add_ps(orgz, _mm_mul_ps(dirz, *t))), 
                        _mm_andnot_ps(cond2, *pz));
        
        *nx = _mm_or_ps(_mm_and_ps(cond2, _mm_set1_ps(plane->n.x)), 
                        _mm_andnot_ps(cond2, *nx));
        *ny = _mm_or_ps(_mm_and_ps(cond2, _mm_set1_ps(plane->n.y)), 
                        _mm_andnot_ps(cond2, *ny));
        *nz = _mm_or_ps(_mm_and_ps(cond2, _mm_set1_ps(plane->n.z)), 
                        _mm_andnot_ps(cond2, *nz));
    }
}


void
orthoBasis(vec *basis, vec n)
{
    basis[2] = n;
    basis[1].x = 0.0; basis[1].y = 0.0; basis[1].z = 0.0;
    
    if ((n.x < 0.6) && (n.x > -0.6)) {
        basis[1].x = 1.0;
    } else if ((n.y < 0.6) && (n.y > -0.6)) {
        basis[1].y = 1.0;
    } else if ((n.z < 0.6) && (n.z > -0.6)) {
        basis[1].z = 1.0;
    } else {
        basis[1].x = 1.0;
    }
    
    vcross(&basis[0], basis[1], basis[2]);
    vnormalize(&basis[0]);
    
    vcross(&basis[1], basis[2], basis[0]);
    vnormalize(&basis[1]);
}


void init_scene();

float 
ambient_occlusion()
{
    vec col;
    
    int   i, j;
    int   ntheta = NAO_SAMPLES;
    int   nphi   = NAO_SAMPLES;
    float eps = 0.0001;
    
    vec p;
    
    p.x = isect.p.x + eps * isect.n.x;
    p.y = isect.p.y + eps * isect.n.y;
    p.z = isect.p.z + eps * isect.n.z;
    
    vec basis[3];
    orthoBasis(basis, isect.n);
    
    float occlusion = 0.0;
    __m128 occlusionx4 = _mm_set1_ps(0.0);
    
    for (j = 0; j < ntheta; j++) {
        
        assert((nphi % 4) == 0);
        for (i = 0; i < nphi; i += 4) {
            
            __m128 theta = _mm_sqrt_ps(_mm_set_ps(rands1[j * ntheta + i], rands1[j * ntheta + i + 1], rands1[j * ntheta + i + 2], rands1[j * ntheta + i + 3]));
            float phi0 = 2 * M_PI * rands2[j * ntheta + i];
            float phi1 = 2 * M_PI * rands2[j * ntheta + i + 1];
            float phi2 = 2 * M_PI * rands2[j * ntheta + i + 2];
            float phi3 = 2 * M_PI * rands2[j * ntheta + i + 3];
            __m128 sinphi = _mm_set_ps(sin(phi0), sin(phi1), sin(phi2), sin(phi3));
            __m128 cosphi = _mm_set_ps(cos(phi0), cos(phi1), cos(phi2), cos(phi3));
            
            __m128 x = _mm_mul_ps(cosphi, theta);
            __m128 y = _mm_mul_ps(sinphi, theta);
            __m128 z = _mm_sqrt_ps(_mm_sub_ps(_mm_set1_ps(1.0), _mm_mul_ps(theta, theta)));
            
            // ray
            __m128 dirx = _mm_add_ps(_mm_mul_ps(x, _mm_set1_ps(basis[0].x)),
                                     _mm_add_ps(_mm_mul_ps(y, _mm_set1_ps(basis[1].x)),
                                                _mm_mul_ps(z, _mm_set1_ps(basis[2].x))));
            __m128 diry = _mm_add_ps(_mm_mul_ps(x, _mm_set1_ps(basis[0].y)),
                                     _mm_add_ps(_mm_mul_ps(y, _mm_set1_ps(basis[1].y)),
                                                _mm_mul_ps(z, _mm_set1_ps(basis[2].y))));
            __m128 dirz = _mm_add_ps(_mm_mul_ps(x, _mm_set1_ps(basis[0].z)),
                                     _mm_add_ps(_mm_mul_ps(y, _mm_set1_ps(basis[1].z)),
                                                _mm_mul_ps(z, _mm_set1_ps(basis[2].z))));
            __m128 orgx = _mm_set1_ps(p.x);
            __m128 orgy = _mm_set1_ps(p.y);
            __m128 orgz = _mm_set1_ps(p.z);
            
            // isect
            __m128 t =  _mm_set1_ps(1.0e+17);
            __m128 hit = _mm_set1_ps(0.0);
            __m128 px, py, pz;
            __m128 nx, ny, nz;
            
            ray_sphere_intersect_simd(&t, &hit, &px, &py, &pz, &nx, &ny, &nz,
                                      dirx, diry, dirz, orgx, orgy, orgz, &spheres[0]);
            ray_sphere_intersect_simd(&t, &hit, &px, &py, &pz, &nx, &ny, &nz,
                                      dirx, diry, dirz, orgx, orgy, orgz, &spheres[1]);
            ray_sphere_intersect_simd(&t, &hit, &px, &py, &pz, &nx, &ny, &nz,
                                      dirx, diry, dirz, orgx, orgy, orgz, &spheres[2]);
            ray_plane_intersect_simd (&t, &hit, &px, &py, &pz, &nx, &ny, &nz,
                                      dirx, diry, dirz, orgx, orgy, orgz, &plane);
            
            occlusionx4 = _mm_add_ps(occlusionx4, _mm_and_ps(hit, _mm_set1_ps(1.0f)));
            
        }
    }
    
    float __attribute__ ((__aligned__(16))) occlusionTmp[4];
    _mm_store_ps(occlusionTmp, occlusionx4);
    occlusion = occlusionTmp[0] + occlusionTmp[1] + occlusionTmp[2] + occlusionTmp[3];
    occlusion = (ntheta * nphi - occlusion) / (float)(ntheta * nphi);
    
    col.x = occlusion;
    col.y = occlusion;
    col.z = occlusion;
    
    return col.x;
}

void
init_scene()
{
    spheres[0].center.x = -2.0;
    spheres[0].center.y =  0.0;
    spheres[0].center.z = -3.5;
    spheres[0].radius = 0.5;
    
    spheres[1].center.x = -0.5;
    spheres[1].center.y =  0.0;
    spheres[1].center.z = -3.0;
    spheres[1].radius = 0.5;
    
    spheres[2].center.x =  1.0;
    spheres[2].center.y =  0.0;
    spheres[2].center.z = -2.2;
    spheres[2].radius = 0.5;
    
    plane.p.x = 0.0;
    plane.p.y = -0.5;
    plane.p.z = 0.0;
    
    plane.n.x = 0.0;
    plane.n.y = 1.0;
    plane.n.z = 0.0;
    
    for (int i = 0; i < 64; i++) {
      rands1[i] = rands1_init[i];
      rands2[i] = rands2_init[i];
    }
    
    isect.t = 0.7907924036719444;
    isect.hit = 1;
    isect.p.x = 0.3484251968503937;
    isect.p.y = -0.49999999999999994;
    isect.p.z = -0.5039370078740157;
    isect.n.x = 0;
    isect.n.y = 1;
    isect.n.z = 0;
}