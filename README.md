# Distributed Systems Project

## Introduction

<img src="screenshot.png">

This project intends to maximize the utilization of computational resources in organizations through distributed systems. 
The primary objective is to harness idle resources of standalone computers and allocate them to a central server for 
efficient workload distribution and processing. This approach diverges from traditional distributed systems, which 
typically rely on high-end, enterprise-grade machines. Instead, it focuses on leveraging the capabilities of conventional 
machines, making the system more accessible and cost-effective.
The project offers significant benefits, including reduced costs by utilizing in-house computational resources 
instead of external cloud servers and enhanced data privacy by keeping data within the organization. Although currently 
focused on image classification, the system's design allows for future expansion into other machine learning domains 
like natural language processing and object detection.


## Installation

### Using docker

```
$ docker build -t distributed-inference .
$ docker run -p 3000:3000 distributed-inference 

```

### Without docker

```bash
$ npm run dev
```


If you are experiencing the following error:

```
Error: error:0308010C:digital envelope routines::unsupported
    at new Hash (node:internal/crypto/hash:69:19)
    ...
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
}
```

Try the following before running:
```bash
$ export NODE_OPTIONS=--openssl-legacy-provider
```


## Usage

Navigate through the webserver (http://[ip]:3000), preferable using different
machines.

Submit a list of image URLs for inference. The following sample list can be used:


```
https://i.imgur.com/CzXTtJV.jpg
https://i.imgur.com/OB0y6MR.jpg
https://farm2.staticflickr.com/1533/26541536141_41abe98db3_z_d.jpg
https://farm4.staticflickr.com/3075/3168662394_7d7103de7d_z_d.jpg
https://farm3.staticflickr.com/2220/1572613671_7311098b76_z_d.jpg
https://farm7.staticflickr.com/6089/6115759179_86316c08ff_z_d.jpg
https://upload.wikimedia.org/wikipedia/commons/4/4c/Bananas.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Pizza_%2848835114221%29.jpg/640px-Pizza_%2848835114221%29.jpg
https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg
https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg
https://upload.wikimedia.org/wikipedia/commons/6/6e/Golde33443.jpg
https://upload.wikimedia.org/wikipedia/commons/6/6b/American_Beaver.jpg
https://upload.wikimedia.org/wikipedia/commons/b/bb/Kittyply_edit1.jpg
https://upload.wikimedia.org/wikipedia/commons/7/77/Delete_key1.jpg
https://upload.wikimedia.org/wikipedia/commons/6/6f/ChessSet.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Piano_Droit.png/640px-Piano_Droit.png
https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Abbie_grainger_in_1985.jpg/640px-Abbie_grainger_in_1985.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Whale_at_Maui_-_panoramio.jpg/640px-Whale_at_Maui_-_panoramio.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Polar_Bear_-_Alaska_%28cropped%29.jpg/640px-Polar_Bear_-_Alaska_%28cropped%29.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Spotted_Puffer_Fish._%2813421084473%29.jpg/640px-Spotted_Puffer_Fish._%2813421084473%29.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Mountain_gorilla_%28Gorilla_beringei_beringei%29_female_eating_root.jpg/640px-Mountain_gorilla_%28Gorilla_beringei_beringei%29_female_eating_root.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Taxi_of_Kolkata.jpg/640px-Taxi_of_Kolkata.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kyotop_Kitchen_Knife_%2846899633822%29.jpg/640px-Kyotop_Kitchen_Knife_%2846899633822%29.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Toilet_seat_3.jpg/640px-Toilet_seat_3.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Red_deer_stag_2009_denmark.jpg/640px-Red_deer_stag_2009_denmark.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Dodge-based_recreational_vehicle_in_Munich.JPG/640px-Dodge-based_recreational_vehicle_in_Munich.JPG
https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Beach_at_Fort_Lauderdale.jpg/640px-Beach_at_Fort_Lauderdale.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Cordless_electric_%28screw%29_drill.jpg/640px-Cordless_electric_%28screw%29_drill.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/STS120LaunchHiRes.jpg/640px-STS120LaunchHiRes.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Augustine_Volcano_Jan_12_2006.jpg/640px-Augustine_Volcano_Jan_12_2006.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/White_mushroom_in_the_park_3.jpg/640px-White_mushroom_in_the_park_3.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Espresso_shot.jpg/640px-Espresso_shot.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Red_dragons_kwalificeren_zich_tegen_grieken_voor_ek.jpg/640px-Red_dragons_kwalificeren_zich_tegen_grieken_voor_ek.jpg
https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Crossword_WikiWorld_link.png/640px-Crossword_WikiWorld_link.png
https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Balaclava_3_hole_black.jpg/640px-Balaclava_3_hole_black.jpg
```
