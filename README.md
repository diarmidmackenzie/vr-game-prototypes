# vr-game-prototypes
 Prototypes of some VR game concepts



## 3D Jigsaw

http://127.0.0.1:8000/AframeProjects/vr-game-prototypes/3d-jigsaw/

Uses CSG to decompose the 3D model into parts.
Rays from controllers can be used to grab the pieces and move them.
I didn't yet implement the part where they stick back together again...!  (beginnings of this are in "piece-matching" branch).
Would also be nice to preserve the object texture through the CSG dissection.  Not yet looked at how to do that...





### The Castle

A 3D environment - I've not yet decided what to do with it...



"Butron castle" (https://skfb.ly/6ZzxB) by FUD-UJEP is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).



Perf notes

- By itself, environment is ~11 raf
- Particles don't seem to make much difference
- Env + castle without particles is ~39 raf.  With (500 snow particles, size 10, opacity 0.1) , raf becomes more variable, from 34 to 44.... Strange that it is sometime better...

