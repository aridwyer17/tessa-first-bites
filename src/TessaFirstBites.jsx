import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import React from "react";
import { db, ref, set, onValue } from "./firebase.js";

/* 🌱 TESSA'S FIRST BITES — 8-Week Solid Starts + Accelerated Allergen Plan */

const START=new Date(2026,1,14); // Feb 14, 2026 (Sat)
const dayDate=(d)=>{const dt=new Date(START);dt.setDate(dt.getDate()+d-1);return dt.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});};
const dayDow=(d)=>{const dt=new Date(START);dt.setDate(dt.getDate()+d-1);return dt.getDay();}; // 0=Sun,6=Sat

const C={bg:"#FAF7F2",card:"#fff",border:"#E8E2D9",text:"#2D2A26",muted:"#8C857B",warm:"#6B6359",accent:"#C06B3E",accentLt:"#F5E6DC",green:"#5B8C5A",greenLt:"#E8F2E8",gold:"#D4A03C",goldLt:"#FFF7E6",red:"#C44D4D",redLt:"#FDE8E8",blue:"#5B7FA5",blueLt:"#E8F0F7",purple:"#7B6BA5",purpleLt:"#F0ECF7",hdr:"linear-gradient(135deg,#B8D8BA,#9CC89E,#B8D8BA)",hdrText:"#2D3A2E",shadow:"0 1px 3px rgba(0,0,0,0.06)",shadowMd:"0 4px 8px rgba(0,0,0,0.06)",r:"12px",rs:"8px",serif:"'Source Serif 4','Georgia',serif",sans:"'DM Sans','Helvetica Neue',sans-serif"};

const ALL={peanut:{n:"Peanut",e:"🥜",c:"#C4956A"},egg:{n:"Egg",e:"🥚",c:"#F5D97E"},dairy:{n:"Dairy",e:"🥛",c:"#ddd"},wheat:{n:"Wheat",e:"🌾",c:"#D4A96A"},sesame:{n:"Sesame",e:"✨",c:"#E8D5B7"},almond:{n:"Almond",e:"🌰",c:"#A67B5B"},walnut:{n:"Walnut",e:"🟤",c:"#8B6F47"},hazelnut:{n:"Hazelnut",e:"🤎",c:"#9B7653"},pistachio:{n:"Pistachio",e:"💚",c:"#93C572"},pecan:{n:"Pecan",e:"🍂",c:"#A0522D"},fish:{n:"Fish",e:"🐟",c:"#7EB6D8"},shellfish:{n:"Shellfish",e:"🦐",c:"#E8927C"},soy:{n:"Soy",e:"🫛",c:"#B5CC7E"}};
const SCH={peanut:[1,2,7,9,11,13,14,15,17,18,19,20,21],egg:[3,4,6,9,11,13,17,20],dairy:[5,6,7,10,12,14,17,21],wheat:[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],sesame:[8,9,11,13,16,20],almond:[10,11,13,14,15,17,18,19,20,21],walnut:[12,13,15,17,19,20,21],hazelnut:[14,15,17,19,20,21],pistachio:[16,17,19,20,21],pecan:[18,19,20,21],fish:[15,16],shellfish:[19],soy:[21]};
const isIntro=(a,d)=>SCH[a]?.[0]===d;

// Nutrition tags for foods
const NTAGS={sweet_potato:"🩸 Iron · Vitamin A",avocado:"🥑 Healthy Fats",banana:"🍌 Potassium · Carrier",broccoli:"🩸 Iron · 🍊 Vit C",lentils:"🩸🩸 Iron · Zinc · Protein",chicken:"🩸 Heme Iron · Zinc",hemp_seeds:"🩸 Iron · Zinc · 🐟 Omega-3",mango:"🍊 Vit C (iron booster!)",bell_pepper:"🍊🍊 Vit C powerhouse",carrots:"Vitamin A",peas:"🩸 Iron · Protein",spinach:"🩸 Iron (pair w/ Vit C!)",black_beans:"🩸 Iron · Zinc · Protein",corn:"Fiber · Fun texture",blueberries:"🍊 Vit C · Antioxidants",pear:"🍊 Vit C · Fiber",cauliflower:"Vit C · Mild",beef:"🩸🩸 Heme Iron · Zinc (richest!)",zucchini:"Mild · Easy texture",butternut_squash:"Vitamin A · Sweet carrier",peach:"🍊 Vit C",chickpeas:"🩸 Iron · Protein",tomato:"🍊 Vit C (barrier cream!)",artichoke:"Fiber · Unique flavor",rice:"Gentle grain",polenta:"Creamy · Iron-fortified",corn_tortilla:"Whole grain · Fun",kidney_beans:"🩸 Iron · Protein",pumpkin_seeds:"🩸 Iron · Zinc",crispy_tofu:"Protein · New texture",chayote:"Mild · Vitamin C",cinnamon:"Anti-inflammatory",cumin:"Digestive · Savory",paprika:"Vitamin A · Mild spice"};

const EDU={
  gagging:{t:"Gagging Is Normal",i:"💡",x:"Gagging is a safety reflex — loud and visible. Choking is SILENT. Stay calm, hands off, let her work through it.",bg:C.blueLt,c:C.blue},
  contact:{t:"Contact Rash vs. Allergy",i:"🔍",x:"Acidic foods cause harmless rash ONLY around the mouth — fades after cleansing. Apply petroleum jelly before meals. Widespread/raised/itchy rash elsewhere → STOP and call parents.",bg:C.goldLt,c:C.gold},
  reaction:{t:"🚨 Allergic Reaction Signs",i:"🚨",x:"After a NEW allergen, watch 10–15 min. CALL 911 for: hives/welts, face/lip/tongue swelling, vomiting within 2 hrs, difficulty breathing. STAY HOME 2 hours after first exposures.",bg:C.redLt,c:C.red},
  iron:{t:"Iron Matters",i:"💪",x:"Baby's iron stores deplete around 6 months. Breast milk has very little iron. Prioritize: red meat, chicken, lentils, beans, egg yolks, spinach, hemp seeds. Pair plant iron with vitamin C foods to boost absorption!",bg:C.greenLt,c:C.green},
  repeat:{t:"Repetition = Tolerance",i:"🔄",x:"After safe introduction, repeat each allergen ≥2×/week. Sustained exposure builds tolerance.",bg:C.purpleLt,c:C.purple},
  twoways:{t:"Serve 'Two Ways'",i:"🥄",x:"Preload spoon, hold in air. Let Tessa reach and grab. Also offer on tray for hand exploration.",bg:C.accentLt,c:C.accent},
  nuts:{t:"Nut Combining Rule",i:"🥜",x:"Each nut gets 2 individual exposures, then joins the blend. By Day 20, all 6 nuts = 1 slot!",bg:C.accentLt,c:C.accent},
  family:{t:"Family Meals Help",i:"👨‍👩‍👧",x:"Even 1 shared meal/week prevents picky eating. Pull baby's portion BEFORE seasoning.",bg:C.greenLt,c:C.green},
  fpies:{t:"FPIES Warning",i:"⚠️",x:"Severe repeated vomiting 2–4 HOURS after eating (not immediately). Go to ER. Triggers: oat, rice, egg, dairy, fish.",bg:C.redLt,c:C.red},
  vitc:{t:"🍊 Vitamin C + Iron Pairing",i:"🍊",x:"Vitamin C dramatically increases iron absorption from plant foods (lentils, beans, spinach). Serve together: bell pepper with lentils, mango with beans, broccoli with egg yolks. This can double or triple iron uptake!",bg:C.goldLt,c:C.gold},
  hemp:{t:"🌱 Hemp Seed Habit",i:"🌱",x:"Sprinkle 1–2 tsp ground hemp seeds on EVERYTHING — pancakes, yogurt, avocado, sweet potato. Each serving adds iron + zinc + omega-3. Start this habit now and keep it up!",bg:C.greenLt,c:C.green},
};

const NB=[
  {wk:[1],w:"Week 1 — No Blend Needed",t:"Use your jar of smooth peanut butter. To serve: scoop ¼–2 tsp PB into a small bowl. Add 1 tsp breast milk. Stir vigorously until completely smooth and runny — it should drip easily off a spoon. Offer on your clean fingertip or a preloaded baby spoon."},
  {wk:[2],w:"Week 2, Day 11 — Make PB-Almond Blend (fresh jar)",t:"After almond's 2nd safe exposure (Day 10 + 11), it can join peanut. GET A SMALL JAR with a lid (baby food jar or small mason jar). Scoop 1 tablespoon of smooth peanut butter into the jar. Add 1 tablespoon of smooth almond butter. That's 2 tablespoons total — a small batch. Stir well until uniform color, no streaks. Label with tape: 'PB-Almond Blend' + today's date. Fridge. TO SERVE: 1 teaspoon blend + 1 teaspoon breast milk → stir until smooth and runny → swirl into cereal, pancake, or yogurt. WHY SMALL BATCH: We make a fresh jar each time a new nut is added. This keeps the ratio of each nut EQUAL."},
  {wk:[2],w:"🔧 Day 12 — Make Walnut Butter from Scratch",t:"You'll need this for the Triple-Nut blend tomorrow. EQUIPMENT: Food processor (or high-powered blender). INGREDIENTS: 1 cup raw walnut halves, ½ tsp neutral oil (avocado or grapeseed). STEPS: 1) Optional but recommended: toast walnuts on a baking sheet at 350°F for 8 min. Let cool. 2) Pour walnuts into food processor. 3) Process continuously. Minutes 1–3: chopped, then crumbly. Minutes 4–6: starts clumping into a ball. Minutes 7–10: ball breaks down, becomes paste. SCRAPE SIDES every 2 min with a spatula. 4) If still thick at 10 min, add ½ tsp oil. Process another 2–3 min until smooth. 5) Walnut butter stays slightly grainy — that's normal! It won't be as silky as PB. 6) Scoop into a small jar. Label: 'Walnut Butter' + date. YIELD: ~½ cup. STORAGE: 2 weeks fridge. TIP: Make this the night before Day 13 so it's ready for the blend."},
  {wk:[2],w:"Week 2, Day 13 — Make FRESH Triple-Nut Blend (new jar)",t:"DISCARD any leftover PB-Almond blend (or save for yourself!). GET A CLEAN JAR. Measure and add: 1 tablespoon smooth PB (from jar) + 1 tablespoon almond butter (from jar) + 1 tablespoon homemade walnut butter = 3 tablespoons total. Stir well until completely uniform. Label: 'Triple-Nut Blend' + date. Fridge. Serve same way: 1 tsp blend + 1 tsp breast milk, stir until runny."},
  {wk:[3],w:"🔧 Day 14 — Make Hazelnut Butter from Scratch",t:"You'll need this for the Four-Nut blend tomorrow. INGREDIENTS: 1 cup raw hazelnuts (also called filberts), ½ tsp neutral oil. STEPS: 1) Toast hazelnuts at 350°F for 10–12 min until skins crack and darken. 2) IMPORTANT: While still warm, wrap in a clean kitchen towel. Rub vigorously — the papery skins will flake off. Don't worry about getting every last bit. 3) Pour skinned hazelnuts into food processor. 4) Process 8–12 minutes, scraping sides every 2 min. Hazelnuts are very oily — this one gets smooth and creamy! Possibly the best homemade nut butter. 5) Add ½ tsp oil only if needed. 6) Scoop into jar. Label: 'Hazelnut Butter' + date. YIELD: ~½ cup. STORAGE: 2 weeks fridge. NOTE: Do NOT use Nutella — it's mostly sugar and contains milk/soy."},
  {wk:[3],w:"Week 3, Day 15 — Make FRESH Four-Nut Blend (new jar)",t:"DISCARD old blend. CLEAN JAR. Add: 1 tablespoon each of PB (jar), almond butter (jar), homemade walnut butter, homemade hazelnut butter = 4 tablespoons total. Stir well. Label: 'Four-Nut Blend' + date. Fridge. Same serving method."},
  {wk:[3],w:"🔧 Day 16 — Make Pistachio Butter from Scratch",t:"You'll need this for the Five-Nut blend tomorrow. INGREDIENTS: 1 cup raw SHELLED pistachios (unsalted, no dye), ½ tsp neutral oil. STEPS: 1) Optional toast: 325°F for 6–8 min (pistachios burn faster — lower temp!). Let cool. 2) Pour into food processor. 3) Process 10–15 min, scraping sides every 2 min. Pistachios take longer than other nuts — be patient! Minutes 1–5: sandy/crumbly. Minutes 6–10: starts clumping. Minutes 10–15: smooths out. 4) Add ½ tsp oil if needed after 10 min. 5) Result will be a beautiful green-ish butter. 6) Scoop into jar. Label: 'Pistachio Butter' + date. YIELD: ~⅓ cup (pistachios are smaller). STORAGE: 2 weeks fridge. TIP: Buy shelled pistachios to save time. Trader Joe's and Costco sell them."},
  {wk:[3],w:"Week 3, Day 17 — Make FRESH Five-Nut Blend (new jar)",t:"DISCARD old blend. CLEAN JAR. Add: 1 tablespoon each of PB (jar), almond butter (jar), homemade walnut, homemade hazelnut, homemade pistachio butter = 5 tablespoons total. Stir well. Label: 'Five-Nut Blend' + date. Fridge. Same serving method."},
  {wk:[3],w:"🔧 Day 17 evening — Make Pecan Butter from Scratch",t:"You'll need this for pecan introduction Day 18. INGREDIENTS: 1 cup raw pecan halves, ½ tsp neutral oil. STEPS: 1) Toast pecans at 350°F for 8 min. Watch carefully — pecans go from perfect to burnt quickly! 2) Let cool 5 min. Pour into food processor. 3) Process 8–10 min, scraping sides every 2 min. Pecans are very oily — this is one of the fastest and smoothest! You may not even need added oil. 4) Result: rich, dark, incredibly smooth butter. 5) Scoop into jar. Label: 'Pecan Butter' + date. YIELD: ~½ cup. STORAGE: 2 weeks fridge. NOTE: A spoonful of this tastes like pecan pie filling. Dangerous for the adults in the house!"},
  {wk:[3],w:"Week 3, Day 20 — Make FRESH SIX-NUT BLEND (Final!) 🎉",t:"DISCARD old blend. This is the FINAL recipe you'll use for the rest of the plan! GET A CLEAN JAR. Measure and add: 2 tablespoons each of — PB (jar), almond butter (jar), homemade walnut, homemade hazelnut, homemade pistachio, homemade pecan butter. That's 12 tablespoons total = ¾ cup. Stir very well until completely uniform. Label: 'SIX-NUT BLEND' + date. One teaspoon gives Tessa equal exposure to all 6 nuts at once! Keeps 2 weeks in fridge."},
  {wk:[4,5,6,7,8],w:"Weeks 4–8 — Fresh Blend Recipe (every 2 weeks)",t:"When the jar runs low or hits 2 weeks old, make a fresh batch. You'll need to re-make any homemade butters that have run out. GET A CLEAN JAR. Measure and add: 2 tablespoons each of PB (jar), almond butter (jar), homemade walnut, homemade hazelnut, homemade pistachio, homemade pecan butter = 12 tablespoons = ¾ cup. Stir very well until completely uniform. Label: 'SIX-NUT BLEND' + today's date. Fridge. Makes enough for ~2 weeks at 1 tsp/day. TO SERVE EACH DAY: 1 tsp blend + 1 tsp breast milk → stir until runny → swirl into pancake, yogurt, cereal, or sweet potato. TIP: Make all 4 homemade butters in one session — about 45 min total. They each keep 2 weeks."},
  {wk:[4,5,6,7,8],w:"🔧 Homemade Nut Butter Batch Session (~45 min)",t:"Every 2 weeks when you refresh the blend, you'll need fresh homemade butters. Do all 4 in one session: WALNUT (10 min): 1 cup raw walnuts → toast 8 min → food processor 10 min + ½ tsp oil → jar. HAZELNUT (12 min): 1 cup raw hazelnuts → toast 10 min → rub skins off in towel → process 10 min → jar. PISTACHIO (15 min): 1 cup shelled pistachios → toast 6 min at 325°F → process 12–15 min + ½ tsp oil → jar. PECAN (8 min): 1 cup pecan halves → toast 8 min → process 8 min → jar. WIPE food processor between each nut with paper towel (no need to wash). Total yield: ~2 cups across 4 jars. Each lasts 2 weeks in fridge."},
  {wk:[3,4,5,6,7,8],w:"🥞 Allergen Pancake Batch (Day 20, refresh every 2 weeks)",t:"These pancakes contain 9 allergens in one! INGREDIENTS: 1 cup whole wheat flour, 2 large eggs, 2 tablespoons six-nut blend (from the jar), 2 tablespoons tahini, ¾ to 1 cup breast milk, ½ tsp butter or oil. STEPS: Whisk 2 eggs in a large bowl. Add 2 tbsp six-nut blend and 2 tbsp tahini — stir well (will be thick). Add 1 cup flour, stir. Add ¾ cup breast milk, stir until batter is thick-yogurt consistency (add more milk if needed). Heat non-stick pan on medium-low with tiny butter. Pour ~2 tbsp batter per pancake (palm-size). Cook 2–3 min until bubbles appear, flip, 1–2 min more. Makes ~12. Cool completely. TO FREEZE: Lay flat on parchment-lined baking sheet, freeze 1–2 hrs, transfer to freezer bag. Label: 'Allergen Pancakes — 9 allergens — DATE'. TO SERVE: Defrost overnight in fridge OR microwave 20–30 sec. Tear into pieces, mash with 1–2 tbsp breast milk."},
];

const WI={
  1:{t:"First Allergens",s:"Peanut, egg & dairy. Pure allergens only — no carrier foods. Thin with breast milk.",sum:"This week we introduce peanut (Days 1–2), egg (Days 3–4), dairy (Day 5), and wheat via pancake (Day 7). Each new allergen: tiny taste → watch 10–15 min → offer more if clear. STAY HOME 2 hours after each first exposure. Serve allergens pure, thinned with breast milk only."},
  2:{t:"Tree Nuts & Sesame",s:"Sesame, almond, walnut & hazelnut. Start building the nut blend!",sum:"Introducing sesame (Day 8), almond (Day 10), walnut (Day 12), and hazelnut (Day 14). Start combining nuts after 2 safe exposures each: PB-Almond blend Day 11, Triple-Nut Day 13. Previously-introduced allergens can be mixed together freely."},
  3:{t:"All 13 Complete!",s:"Pistachio, pecan, fish, shellfish & soy. Pancake batch Day 20!",sum:"Finishing all 13 allergens: fish (Day 15), pistachio (Day 16), pecan (Day 18), shellfish (Day 19), soy (Day 21). Only ONE new allergen per day! Complete the six-nut blend Day 20 and MAKE ALLERGEN PANCAKE BATCH — 9 allergens in one freezer-friendly food!"},
  4:{t:"Foundation Carriers",s:"Sweet potato, avocado, banana, broccoli, lentils, chicken, hemp seeds.",sum:"2 meals/day begins! Nutrient-dense carriers that pair beautifully with allergens. Sweet potato and avocado are perfect for mixing with nut blend. Lentils are an iron powerhouse — serve with broccoli (vitamin C) to boost absorption. Start the hemp seed habit Day 28: sprinkle on everything for iron + zinc + omega-3."},
  5:{t:"Expanding Palate",s:"Mango, bell pepper, carrots, peas, spinach, black beans, corn.",sum:"Mango (Sat) and bell pepper (Sun) are introduced on the weekend when parents are home due to family allergies. Both are vitamin C powerhouses — pair with iron-rich foods all week! Spinach + mango leftovers = iron + vitamin C combo."},
  6:{t:"Bold Flavors",s:"Blueberries, pear, cauliflower, beef, zucchini, butternut squash, peach.",sum:"Beef arrives Day 39 — the single richest source of heme iron and zinc. Blueberries and pear add vitamin C and antioxidants. Butternut squash is a sweet carrier for allergens, like sweet potato."},
  7:{t:"Complex Foods",s:"Chickpeas, tomato, artichoke, rice, polenta, corn tortilla, kidney beans.",sum:"Hummus Day 43! Chickpeas + tahini = iron + protein. Tomato on weekend for vitamin C (use barrier cream for contact rash). First grains beyond wheat: rice and polenta. Taco night Day 49!"},
  8:{t:"Finishing Strong!",s:"Pumpkin seeds, crispy tofu, chayote, cinnamon, cumin, paprika. 🎉",sum:"Final week! Pumpkin seeds (iron + zinc, grind & sprinkle like hemp seeds). Spice introductions: cinnamon, cumin, paprika. Day 56: CELEBRATION BRUNCH — all allergens, all skills, the whole family! 🎊"},
};

const BP={
  1:["No batch cooking needed — allergens served individually","Day 7: Make PB-egg wheat pancakes (freeze extras!)","Buy: smooth PB, eggs, yogurt, wheat cereal, whole wheat flour"],
  2:["Boil 4 eggs Day 8 → Days 9-11. Re-boil Day 12 → Days 13-14","Build nut blend: PB-Almond Day 11, +Walnut Day 13","Buy: tahini, almond butter, walnut butter, hazelnut butter"],
  3:["Boil eggs Day 15 or 17","Bake 2 salmon fillets Day 15 → Days 15-16","Boil shrimp Day 19 (shellfish intro) — extras for Week 4","Open tofu Day 21 (soy intro) → use in Week 4","Complete six-nut blend Day 20","🥞 DAY 20: Make ALLERGEN PANCAKE BATCH (12 pancakes → freeze!)"],
  4:["🥜 Make fresh six-nut blend","🥞 Use frozen allergen pancakes for AM meals","Boil 6 eggs Day 22 → Days 22-24. Re-boil Day 25 → Days 25-28","Steam sweet potatoes Day 22 → Days 22, 24 (batch)","Slow-cook chicken Day 27 → Days 27, 29 leftovers","Cook red lentils Day 26 → Days 26-28 (3-day cluster!)","Open tofu Day 24 → Days 24, 26"],
  5:["Boil eggs Day 29, re-boil Day 32","Bake salmon Day 31 → Days 31, 33","Boil shrimp Day 32 → Days 32, 34","Steam carrots batch Day 31 → Days 31-33","Cook black beans Day 34 → Days 34-35","Steam broccoli (or use frozen) for iron+vitamin C pairing"],
  6:["🥜 Make fresh six-nut blend","🥞 Make fresh allergen pancake batch","Boil eggs Day 36, re-boil Day 39","Slow-cook beef Day 39 → Days 39-41","Bake salmon Day 38 → Days 38, 40","Boil shrimp Day 36 → Days 36, 40","Open tofu Day 37 → Days 37, 39"],
  7:["Boil eggs Day 43, re-boil Day 46","Make hummus Day 43 (chickpeas+tahini) → Days 43-45","Bake salmon Day 43 → Days 43, 46. Fresh Day 48","Boil shrimp Day 45 → Days 45, 47","Cook rice Day 46 → Days 46-47","Slow-cook chicken Day 47 → Days 47-48","Open tofu Day 44 → Days 44, 46. Fresh Day 49"],
  8:["🥜 Make fresh six-nut blend (final!)","🥞 Make fresh allergen pancake batch (final!)","Boil eggs Day 50, re-boil Day 53","Bake salmon Day 50 → Days 50, 52. Fresh Day 54","Boil shrimp Day 51 → Days 51, 53. Fresh Day 55","Cook lentils Day 53 → Days 53-55","Slow-cook beef Day 55 → Days 55-56"],
};

// Week 1-3 detailed meals (per-food reaction tracking)
const W13=[
{d:1,w:1,t:"Peanut Introduction",items:[
{food:"peanut",r:{n:"Smooth PB — First Taste",tm:"5 min",
ing:["¼ tsp smooth PB (no honey, no added allergens)","1 tsp breast milk"],
steps:["Put ¼ tsp PB in a small bowl.","Add 1 tsp breast milk. Stir until completely smooth and runny — should drip off spoon.","Dip clean finger in thinned PB. Hold near Tessa's lips — let HER come to it.","If she turns away, wait 1 min, try again gently.","Watch closely 10–15 min for: hives, swelling around eyes/lips, vomiting, unusual fussiness.","If NO reaction after 15 min, offer 1–2 more fingertip tastes.","STAY HOME 2 full hours."],
store:"Discard leftover. Make fresh each time.",
mod:"PB powder (PB2) + water works. Never chunky PB or products with honey."},edu:["reaction"]}]},
{d:2,w:1,t:"Peanut — 2nd Exposure",items:[
{food:"peanut",r:{n:"Thinned PB on Preloaded Spoon",tm:"5 min",
ing:["2 tsp smooth PB","1 tsp breast milk"],
steps:["Thin 2 tsp PB with breast milk until smooth and runny.","Scoop onto baby spoon. Hold in air 6 inches from Tessa.","Wait for her to grab it. Let HER bring it to her mouth.","Offer 2–3 more preloaded spoons. No need to stay home — peanut established!"],
store:"Discard leftovers.",mod:""},edu:["twoways"]}]},
{d:3,w:1,t:"Egg Introduction",items:[
{food:"egg",r:{n:"Mashed Hard-Boiled Egg — First Taste",tm:"20 min",
ing:["4 large eggs (batch — use Days 3, 4, 6!)","Breast milk","Small pot, bowl of cold water"],
steps:["Place 4 eggs in pot. Cover with cold water (1 inch above).","HIGH heat → rolling boil. Turn OFF heat, lid on.","Timer 12 min. Don't lift lid.","Transfer eggs to cold water bowl. Cool 5 min.","Peel ONE egg under running water.","Cut into 4 quarters. Put 1 quarter in small bowl.","Mash with fork + 1–2 tsp breast milk until smooth like thick yogurt.","Offer tiny amount on preloaded spoon. Watch 10–15 min.","Egg often causes GAGGING — soft texture spreads in mouth. This is NORMAL, not choking!","If gagging: stay calm, hands off, let her work through it.","If no reaction after 15 min, offer more. STAY HOME 2 hours."],
store:"Hard-boiled in shell: 3 days fridge (covers Days 3, 4, 6). Mashed: same day only.",
mod:"Intense gagging? Thin more with breast milk until almost liquid."},edu:["reaction","gagging"]}]},
{d:4,w:1,t:"Egg — 2nd Exposure",items:[
{food:"egg",r:{n:"Mashed Egg (Larger Portion)",tm:"5 min",
ing:["1 egg from Day 3 batch","Breast milk"],
steps:["Peel egg from fridge. Mash TWO quarters with breast milk — double Day 3.","Preloaded spoon. Gagging may still occur — still normal.","Offer up to half the egg."],
store:"Day 3 eggs: use by Day 6.",mod:"Try scrambled: whisk egg, cook in dry non-stick pan medium-low 3-4 min, stir. Cut into 2-finger strips."},edu:["gagging"]}]},
{d:5,w:1,t:"Dairy Introduction",items:[
{food:"dairy",r:{n:"Plain Whole Milk Yogurt — First Taste",tm:"2 min",
ing:["2–4 oz plain whole milk yogurt (full-fat, no sugar, no honey — just milk + cultures)"],
steps:["Take out 10 min early for room temp. Scoop 2 tbsp into bowl.","Preloaded spoon. Watch 10–15 min.","Also dollop on tray for messy exploration — this is how babies learn!","STAY HOME 2 hours."],
store:"Re-seal. 3–5 days fridge.",
mod:"Greek yogurt (plain, full-fat) is great. Stonyfield, FAGE plain, Siggi's. NEVER honey yogurt."},edu:["reaction"]}]},
{d:6,w:1,t:"Dairy + Egg",items:[
{food:"dairy",r:{n:"Yogurt",tm:"2 min",ing:["3 oz yogurt"],steps:["Scoop, preloaded spoon. 2nd dairy exposure."],store:"Same container.",mod:""}},
{food:"egg",r:{n:"Mashed Egg",tm:"5 min",ing:["1 egg from Day 3 batch","breast milk"],steps:["Mash 2 quarters. Separate spoon from yogurt. 3rd egg — gagging should be decreasing."],store:"Last day for Day 3 eggs.",mod:"If expired, boil 1 fresh."}}],edu:["repeat"]},
{d:7,w:1,t:"Wheat Introduction — PB-Egg Pancake",items:[
{food:"wheat",r:{n:"Baby Pancake with Egg & PB (Wheat First Taste!)",tm:"15 min",
ing:["3 tbsp whole wheat flour","1 egg (established)","2 tsp smooth PB (established)","3–4 tbsp breast milk","Tiny bit unsalted butter/oil for pan"],
steps:["Whisk egg in bowl. Add 3 tbsp whole wheat flour, stir.","Add 2 tsp PB. Stir — will be thick.","Add breast milk 1 tbsp at a time until thick-yogurt batter.","Non-stick pan on MEDIUM-LOW. Tiny butter pat.","Pour ~2 tbsp batter per pancake (palm-size). Make 2–3.","Cook 2–3 min until edges set + bubbles. Flip gently.","Other side 1–2 min until golden.","Cool 3–4 min. Check temp on your wrist.","Tear 1 pancake into thumbnail pieces. Add 1–2 tbsp breast milk.","Mash with fork until porridge-like. Some soft lumps fine.","Offer spoonful. Wheat is NEW — watch 10–15 min.","If clear, offer more. Also offer small intact piece as finger food.","STAY HOME 2 hours."],
store:"Extra pancakes: 3 days fridge, 2 months freezer! Great grab-and-go allergen meal.",
mod:"This pancake = wheat + egg + PB in one. Freeze extras! Future batches can include more allergens."}},
{food:"egg",r:{n:"(In the pancake)",tm:"0 min",ing:["Included above"],steps:["Pancake has 1 egg — 4th egg exposure!"],store:"",mod:""}},
{food:"peanut",r:{n:"(In the pancake)",tm:"0 min",ing:["Included above"],steps:["Pancake has 2 tsp PB — 3rd peanut exposure!"],store:"",mod:""}},
{food:"dairy",r:{n:"Yogurt on the side",tm:"1 min",ing:["2–3 tbsp yogurt"],steps:["Serve alongside. Use as dip for intact pancake pieces!"],store:"3-5 days.",mod:""}}],edu:["reaction","iron"]},
{d:8,w:2,t:"Sesame Introduction + Wheat",items:[
{food:"sesame",r:{n:"Tahini — First Taste",tm:"5 min",
ing:["1–2 tsp tahini","1 tsp breast milk"],
steps:["Stir tahini jar — oil separates.","Scoop 1–2 tsp into bowl. Add breast milk, stir until RUNNY.","Fingertip taste. Watch 10–15 min. STAY HOME 2 hours."],
store:"Tahini jar: 2–3 months fridge.",mod:"Find near PB or international aisle. Soom, 365, Joyva."}},
{food:"wheat",r:{n:"Wheat Cereal or Defrosted Pancake",tm:"3 min",ing:["3 tbsp wheat cereal + breast milk, OR 1 defrosted pancake mashed with breast milk"],steps:["Serve alongside tahini on separate spoon."],store:"Same day.",mod:"Leftover pancakes from Day 7 work great!"}}],edu:["reaction"]},
{d:9,w:2,t:"PB + Egg + Sesame + Wheat",items:[
{food:"peanut",r:{n:"PB + Tahini in Wheat Cereal (all established — mix!)",tm:"5 min",
ing:["2 tsp PB","1 tsp tahini","3 tbsp wheat cereal","4 tbsp breast milk"],
steps:["Mix cereal with breast milk. Thin PB + tahini separately, swirl in. All established — combine freely!"],store:"Same day.",mod:""}},
{food:"egg",r:{n:"Mashed Egg (BOIL FRESH BATCH!)",tm:"20 min",ing:["4 eggs (fresh batch → Days 9, 11, 13)","breast milk"],steps:["Boil 4 eggs. Peel 1, mash 2 quarters. Separate spoon."],store:"3 days fridge.",mod:""}}],edu:["twoways","nuts"]},
{d:10,w:2,t:"Almond Introduction + Dairy + Wheat",items:[
{food:"almond",r:{n:"Almond Butter — First Taste",tm:"5 min",
ing:["2 tsp smooth almond butter","1 tsp breast milk"],
steps:["Thin with breast milk. Fingertip taste. Watch 10–15 min. STAY HOME 2 hours."],
store:"Several weeks fridge.",mod:"Grind raw almonds + ½ tsp oil in food processor 3–5 min. Or almond flour + breast milk paste."}},
{food:"dairy",r:{n:"Yogurt",tm:"1 min",ing:["3 oz yogurt"],steps:["Serve alongside."],store:"",mod:""}},
{food:"wheat",r:{n:"Allergen Pancake or Wheat Cereal",tm:"3 min",ing:["Defrosted pancake mashed w/ breast milk, or wheat cereal"],steps:["Serve on separate spoon."],store:"",mod:""}}],edu:["reaction"]},
{d:11,w:2,t:"PB-Almond Blend + Egg + Wheat",items:[
{food:"peanut",r:{n:"PB-Almond Blend in Wheat Cereal",tm:"8 min",
ing:["FRESH JAR: 1 tbsp PB + 1 tbsp almond butter","1 tsp blend","wheat cereal or pancake","breast milk"],
steps:["Make a FRESH small jar: 1 tbsp PB + 1 tbsp almond butter. Stir well. Label: PB-Almond Blend + date. Fridge.","Thin 1 tsp of the new blend into cereal or mashed pancake. PB + Almond now share 1 slot!"],
store:"Blend: 2 weeks fridge.",mod:""}},
{food:"egg",r:{n:"Mashed Egg",tm:"5 min",ing:["1 egg from Day 9","breast milk"],steps:["Mash 2 quarters. Separate spoon."],store:"Good through Day 11.",mod:""}}],edu:["nuts"]},
{d:12,w:2,t:"Walnut Introduction + Dairy + Wheat",items:[
{food:"walnut",r:{n:"Walnut Butter — First Taste",tm:"5 min",
ing:["2 tsp walnut butter","1 tsp breast milk"],
steps:["Thin. Fingertip. Watch 10–15 min. STAY HOME 2 hours."],
store:"2 weeks fridge.",mod:"Make: 1 cup raw walnuts + ½ tsp oil in food processor 3–5 min."}},
{food:"dairy",r:{n:"Yogurt",tm:"1 min",ing:["3 oz yogurt"],steps:["Alongside."],store:"",mod:""}},
{food:"wheat",r:{n:"Pancake or Wheat Cereal",tm:"3 min",ing:["Defrosted pancake or cereal + breast milk"],steps:["Serve."],store:"",mod:""}}],edu:["reaction"]},
{d:13,w:2,t:"Triple-Nut + Egg + Wheat",items:[
{food:"peanut",r:{n:"Triple-Nut Blend",tm:"8 min",
ing:["FRESH JAR: 1 tbsp each PB, almond, walnut","1 tsp blend","cereal or pancake","breast milk"],
steps:["DISCARD old PB-Almond jar (or keep for yourself!). Make FRESH jar: 1 tbsp each of PB, almond, walnut butter = 3 tbsp total. Stir well. Label: Triple-Nut Blend + date. This keeps all nuts at equal ratios!","Thin 1 tsp of the new blend into cereal/pancake."],store:"2 weeks.",mod:""}},
{food:"egg",r:{n:"Mashed Egg (BOIL FRESH!)",tm:"20 min",ing:["4 eggs (→ Days 13-16)","breast milk"],steps:["Fresh batch. Mash 2 quarters."],store:"3 days.",mod:""}}],edu:["repeat"]},
{d:14,w:2,t:"Hazelnut Intro + Dairy + PB + Wheat",items:[
{food:"hazelnut",r:{n:"Hazelnut Butter — First Taste",tm:"5 min",
ing:["2 tsp hazelnut butter","1 tsp breast milk"],
steps:["Thin. Fingertip. Watch 10–15 min. STAY HOME 2 hours."],
store:"2 weeks.",mod:"Don't use Nutella — mostly sugar + milk/soy."}},
{food:"dairy",r:{n:"Yogurt",tm:"1 min",ing:["3 oz yogurt"],steps:["Alongside."],store:"",mod:""}},
{food:"peanut",r:{n:"PB in Pancake or Cereal",tm:"3 min",ing:["Defrosted pancake (has PB built in!) or 2 tsp PB in cereal"],steps:["Serve."],store:"",mod:""}}],edu:["reaction"]},
{d:15,w:3,t:"Fish Introduction + 4-Nut + Wheat",items:[
{food:"fish",r:{n:"Baked Salmon — First Taste",tm:"25 min",
ing:["2 salmon fillets, skin-on (~4 oz each — extra for Day 16!)","1 tsp olive oil","Parchment, baking sheet"],
steps:["Preheat 375°F. Line sheet with parchment.","Both fillets skin-side DOWN. Drizzle ½ tsp oil each.","Bake 12–15 min until flakes with fork, opaque throughout.","Cool 5 min. For Tessa: ~1 oz piece.","CAREFULLY feel for and remove ALL bones — even tiny pin bones. Critical!","Mash with fork + 1 tsp breast milk. Smooth, no chunks.","Offer tiny amount on spoon. Watch 10–15 min. STAY HOME 2 hours.","Wrap second fillet — use Day 16."],
store:"Cooked salmon: 3 days fridge. ALWAYS check bones.",
mod:"Canned boneless salmon works. Wild-caught ideal."}},
{food:"peanut",r:{n:"Four-Nut Blend (+hazelnut!) in Cereal",tm:"5 min",
ing:["FRESH JAR: 1 tbsp each PB, almond, walnut, hazelnut","1 tsp blend","cereal","breast milk"],
steps:["DISCARD old blend. FRESH jar: 1 tbsp each of PB, almond, walnut, hazelnut = 4 tbsp. Stir well. Label: Four-Nut Blend + date.","Thin 1 tsp into cereal."],store:"2 weeks.",mod:""}}],edu:["reaction","fpies"]},
{d:16,w:3,t:"Pistachio Intro + Fish + Sesame + Wheat",items:[
{food:"pistachio",r:{n:"Pistachio Butter — First Taste",tm:"5 min",
ing:["2 tsp pistachio butter","1 tsp breast milk"],
steps:["Thin. Fingertip. Watch 10–15 min. STAY HOME 2 hours."],
store:"2 weeks.",mod:"Make: 1 cup raw pistachios + ½ tsp oil, process 4–5 min."}},
{food:"fish",r:{n:"Leftover Salmon (Day 15)",tm:"3 min",ing:["Leftover fillet"],steps:["Check bones again. Mash with breast milk. Spoon."],store:"Use today.",mod:""}},
{food:"sesame",r:{n:"Tahini in Cereal",tm:"3 min",ing:["1 tsp tahini","cereal","breast milk"],steps:["Thin tahini into cereal."],store:"",mod:""}}],edu:["reaction"]},
{d:17,w:3,t:"5-Nut + Egg + Dairy + Wheat",items:[
{food:"peanut",r:{n:"Five-Nut Blend (+pistachio!)",tm:"5 min",
ing:["FRESH JAR: 1 tbsp each PB, almond, walnut, hazelnut, pistachio","1 tsp blend","cereal or pancake","breast milk"],
steps:["DISCARD old blend. FRESH jar: 1 tbsp each of PB, almond, walnut, hazelnut, pistachio = 5 tbsp. Stir well. Label: Five-Nut Blend + date.","Thin 1 tsp into cereal/pancake."],store:"",mod:""}},
{food:"egg",r:{n:"Mashed Egg",tm:"5 min",ing:["1 egg from Day 13 batch (check date!)","breast milk"],steps:["If expired, boil fresh. Mash 2-3 quarters. Can mix into yogurt."],store:"",mod:""}},
{food:"dairy",r:{n:"Yogurt",tm:"1 min",ing:["3 oz yogurt"],steps:["Alongside or mix egg in."],store:"",mod:""}}],edu:["repeat","iron"]},
{d:18,w:3,t:"Pecan Introduction",items:[
{food:"pecan",r:{n:"Pecan Butter — First Taste",tm:"5 min",
ing:["2 tsp pecan butter","1 tsp breast milk"],
steps:["Thin pecan butter with breast milk until smooth and runny.","Offer on fingertip. Watch 10–15 min. STAY HOME 2 hours.","If clear, offer more on preloaded spoon."],
store:"2 weeks fridge.",mod:"Make: grind 1 cup raw pecans + ½ tsp oil in food processor 3–5 min."}},
{food:"peanut",r:{n:"Five-Nut Blend in Cereal",tm:"5 min",
ing:["1 tsp five-nut blend","cereal or defrosted pancake","breast milk"],
steps:["Thin 1 tsp blend into cereal or mashed pancake. Pecan served separately today — needs 2nd exposure before joining blend."],store:"",mod:""}},
{food:"wheat",r:{n:"Cereal or Pancake",tm:"3 min",ing:["Cereal or defrosted pancake + breast milk"],steps:["Serve alongside."],store:"",mod:""}}],edu:["reaction"]},
{d:19,w:3,t:"Shellfish Introduction",items:[
{food:"shellfish",r:{n:"Shrimp Puree — First Taste",tm:"15 min",
ing:["6–8 medium shrimp, raw (batch — extras for Week 4)","Small pot of water"],
steps:["Thaw if frozen (cold water bowl 10–15 min). Pat dry.","Boil ALL shrimp 3–4 min until pink and curl into a C shape.","Drain. Cool under cold running water.","Peel off shells. Pull off tails.","For Tessa: 2 shrimp + 1 tbsp breast milk. Mash VERY smooth with fork.","Offer tiny amount on spoon. Watch 10–15 min. STAY HOME 2 hours.","If clear, offer more.","Store remaining shrimp for Week 4 meals."],
store:"Cooked peeled: 3 days fridge, 2 months freezer.",mod:"Buy raw shell-on (not pre-cooked). Medium size easiest."}},
{food:"pecan",r:{n:"Pecan Butter (2nd exposure — joins blend tomorrow!)",tm:"3 min",
ing:["1 tsp pecan butter","breast milk"],
steps:["Thin pecan butter. Serve on spoon. 2nd safe exposure — pecan can now join the blend!"],store:"",mod:""}},
{food:"peanut",r:{n:"Five-Nut Blend in Cereal/Pancake",tm:"5 min",
ing:["1 tsp five-nut blend","cereal or pancake","breast milk"],
steps:["Thin blend into cereal or mashed pancake."],store:"",mod:""}}],edu:["reaction","fpies"]},
{d:20,w:3,t:"🥞 Allergen Pancake Batch Day!",items:[
{food:"peanut",r:{n:"SIX-NUT BLEND + ALLERGEN PANCAKE BATCH",tm:"30 min",
ing:["FRESH JAR: 2 tbsp each of PB, almond, walnut, hazelnut, pistachio, pecan → SIX-NUT BLEND 🎉","PANCAKE BATCH: 1 cup whole wheat flour","2 eggs","2 tbsp six-nut blend","2 tbsp tahini","¾–1 cup breast milk","½ tsp butter/oil"],
steps:["FIRST: DISCARD old Five-Nut jar. Make FINAL blend in a CLEAN jar: 2 tbsp each of PB, almond, walnut, hazelnut, pistachio, pecan butter = ¾ cup total. Stir well. Label: SIX-NUT BLEND + date.","NOW PANCAKE BATCH — 9 allergens in one!","Whisk 2 eggs. Add 2 tbsp six-nut blend + 2 tbsp tahini. Stir.","Add 1 cup whole wheat flour. Stir.","Add ¾ cup breast milk. Stir until thick-yogurt batter (add more if needed).","Non-stick pan MEDIUM-LOW. Tiny butter.","~2 tbsp batter per pancake (palm-size). Cook 2–3 min → flip → 1–2 min.","Makes ~12 pancakes. Cool completely.","FOR TESSA TODAY: Tear 1–2 pancakes, mash with breast milk. Spoon + finger food piece.","TO FREEZE: Lay flat on parchment-lined sheet. Freeze 1–2 hrs. Transfer to bag. Label: 'Allergen Pancakes — 9 allergens — DATE'.","Keeps 2 MONTHS frozen. Refresh every 2 weeks with nut blend."],
store:"Freezer: 2 months. Fridge: 3 days. TO SERVE: Defrost overnight in fridge OR microwave 20–30 sec. Tear & mash with breast milk.",
mod:"No new allergen today — just completing the blend and making the batch! Each pancake = wheat, egg, PB, almond, walnut, hazelnut, pistachio, pecan, sesame."}},
{food:"egg",r:{n:"(In pancakes)",tm:"0 min",ing:["Included above"],steps:["Batch uses 2 eggs."],store:"",mod:""}},
{food:"sesame",r:{n:"(Tahini in pancakes)",tm:"0 min",ing:["Included above"],steps:["Batch uses 2 tbsp tahini."],store:"",mod:""}}],edu:["family"]},
{d:21,w:3,t:"Soy Introduction + Dairy + Nuts",items:[
{food:"soy",r:{n:"Silken Tofu — First Taste",tm:"5 min",
ing:["1 package silken tofu (SOFT/SILKEN — not firm)"],
steps:["Open package. Drain the liquid.","Scoop ~2 tbsp into a small bowl.","Mash with fork — silken tofu mashes very easily, yogurt consistency.","No seasoning needed.","Offer on spoon. Watch 10–15 min. STAY HOME 2 hours.","If clear, offer more.","Store rest: submerge in fresh cold water in airtight container. Change water daily."],
store:"Opened tofu in water: 3 days fridge. Will be used in Week 4.",
mod:"Soy yogurt or boiled edamame (shell, mash) work too. ALL 13 ALLERGENS NOW INTRODUCED! 🎉"}},
{food:"dairy",r:{n:"Yogurt",tm:"1 min",ing:["3 oz yogurt"],steps:["Serve alongside tofu on separate spoon."],store:"",mod:""}},
{food:"wheat",r:{n:"Defrosted Allergen Pancake",tm:"3 min",ing:["1–2 pancakes from freezer","breast milk"],steps:["Defrost (overnight in fridge or microwave 20–30 sec). Tear, mash with breast milk. WEEK 3 COMPLETE! 🎊 All 13 allergens introduced!"],store:"",mod:""}}],edu:["repeat"]},
];

// WEEKS 4-8 REVISED ORDER: nutrient-dense carriers first, mango+pepper on weekends
const W48=[
// WEEK 4 — Foundation Carriers
{d:22,w:4,t:"Sweet Potato",nf:"Sweet Potato 🍠",nt:"🩸 Iron · Vitamin A",meals:[
{tm:"AM",n:"Sweet Potato + Allergen Pancake",r:"BATCH STEAM: Peel 2 medium sweet potatoes, cut into finger-length spears. Steam 12–15 min until fork slides through. Serve 2–3 spears as finger food. DEFROST 1–2 ALLERGEN PANCAKES: mash with breast milk. Save rest of sweet potato (Days 22, 24). BOIL 6 EGGS (→ Days 22-24).",items:["sweet_potato","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Nut Yogurt + Sweet Potato",r:"Thin 1 tsp six-nut blend, swirl into yogurt. Leftover sweet potato spears. Tahini drizzle on sweet potato for extra sesame exposure.",items:["dairy","peanut","sesame"]}]},
{d:23,w:4,t:"Avocado",nf:"Avocado 🥑",nt:"🥑 Healthy Fats",meals:[
{tm:"AM",n:"Avocado Two Ways + Pancake",r:"Halve ripe avocado. One half: leave whole for Tessa to scoop/gnaw. Other: mash and mix with mashed pancake for a creamy texture. Egg from batch.",items:["avocado","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Nut-Tahini Yogurt",r:"Nut-tahini yogurt. Leftover sweet potato spears (from Day 22, if within 3 days).",items:["dairy","peanut","sesame"]}]},
{d:24,w:4,t:"Banana",nf:"Banana 🍌",nt:"🍌 Potassium · Carrier",meals:[
{tm:"AM",n:"Banana + Allergen Pancake + Egg",r:"Cut banana in half. Leave skin on bottom half for grip — Tessa holds the skin and gnaws the exposed fruit. DEFROST PANCAKE: mash with breast milk, swirl in some mashed banana for sweetness. Egg from batch. OPEN TOFU (→ Days 24, 26).",items:["banana","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Yogurt-Banana Mash + Tofu",r:"Mash banana into yogurt — babies love this combo. Tofu mash on side.",items:["dairy","soy"]}]},
{d:25,w:4,t:"Broccoli",nf:"Broccoli 🥦",nt:"🩸 Iron · 🍊 Vit C",meals:[
{tm:"AM",n:"Steamed Broccoli + Pancake",r:"BATCH STEAM: Cut 1 head into florets with long stems. Steam 10–12 min until very soft. Stem = handle! Serve 2–3 upright. Save rest (Days 25-27). DEFROST PANCAKE: mash with breast milk. BOIL EGGS Day 25 → Days 25-28.",items:["broccoli","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Nut Yogurt + Avocado",r:"Nut yogurt. Leftover avocado (cut fresh if Day 23's is brown). Tahini drizzle.",items:["dairy","peanut","sesame"]}]},
{d:26,w:4,t:"Lentils",nf:"Red Lentils 🍲",nt:"🩸🩸 Iron · Zinc · Protein",meals:[
{tm:"AM",n:"Lentil Puree + Broccoli + Pancake",r:"BATCH COOK LENTILS (→ Days 26-28): Rinse ½ cup red lentils. Pot + 1½ cups water. Boil, simmer 15–20 min until mushy. Mash. Scoop ¼ cup for Tessa. 🍊 Serve with leftover broccoli — vitamin C boosts iron absorption! DEFROST PANCAKE.",items:["lentils","broccoli","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Lentil-Yogurt + Tofu",r:"Stir lentils into yogurt — thick, creamy, iron-rich. Tofu mash (Day 24 pkg). Bake salmon for Day 26-27.",items:["dairy","fish","soy"]}]},
{d:27,w:4,t:"Chicken",nf:"Chicken 🍗",nt:"🩸 Heme Iron · Zinc",meals:[
{tm:"AM",n:"Chicken Strips + Lentils + Pancake",r:"SLOW-COOK: 2 drumsticks in pot, cover with water. Boil → simmer covered 45–60 min until falling off bone. Shred (discard skin/bones). Thin strips or puree. Save extra for Day 29. Leftover lentils. DEFROST PANCAKE. BOIL SHRIMP (→ Days 27, 29).",items:["chicken","lentils","peanut","egg","wheat","sesame"]},
{tm:"PM (Family!)",n:"Chicken Dinner 🍽️",r:"Family dinner with roasted veggies! Tessa (BEFORE salt): shredded chicken, broccoli, salmon mash. Nut-tahini yogurt.",items:["dairy","fish","shellfish"]}],fm:"Chicken & Veggie Dinner"},
{d:28,w:4,t:"Hemp Seeds",nf:"Hemp Seeds 🌱",nt:"🩸 Iron · Zinc · 🐟 Omega-3",meals:[
{tm:"AM",n:"Hemp-Sprinkled Pancake + Egg + Lentils",r:"DEFROST PANCAKE: mash with breast milk. Sprinkle 1–2 tsp hemp seeds over EVERYTHING — the pancake, leftover lentils (last day of batch). Roll egg strip in hemp seeds too. Iron + zinc + omega-3 in one easy habit! Start doing this every morning.",items:["hemp_seeds","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Nut Yogurt + Banana + Sweet Potato",r:"Nut yogurt with hemp seeds sprinkled on top. Banana. Steam fresh sweet potato if needed.",items:["dairy","peanut"]}],edu2:["hemp"]},
// WEEK 5 — Expanding Palate (Mango + Pepper on weekend!)
{d:29,w:5,t:"Mango ⚠️",nf:"Mango 🥭",nt:"🍊 Vit C (iron booster!)",meals:[
{tm:"AM",n:"Mango Spears + Pancake (WEEKEND — parents home)",r:"⚠️ FAMILY ALLERGY — introduce when parents are home. Choose ripe mango. Cut along flat pit for 2 halves. Cut thick spears (2 finger width, skin on for grip). Serve 2–3. DEFROST PANCAKE. BOIL 6 EGGS. Watch closely for 2 hours.",items:["mango","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Nut Yogurt + Chicken leftovers",r:"Nut yogurt. Leftover chicken from Day 27 (within 3 days? If not, cook fresh). Mango spears on side.",items:["dairy","peanut","shellfish"]}]},
{d:30,w:5,t:"Bell Pepper ⚠️",nf:"Bell Pepper 🫑",nt:"🍊🍊 Vit C powerhouse",meals:[
{tm:"AM",n:"Roasted Pepper + Pancake (WEEKEND — parents home)",r:"⚠️ FAMILY ALLERGY — parents home. Preheat 375°F. Halve pepper, remove stem/seeds/pith. Coat ½ tsp oil. Place cut-side DOWN on parchment. Roast 10 min until tender. Cool 5 min. Offer half for munching. DEFROST PANCAKE. Watch 2 hours.",items:["bell_pepper","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Tahini Yogurt + Egg + Pepper",r:"Tahini yogurt. Egg from batch. Leftover roasted pepper — great for dipping in yogurt. 🍊 This vitamin C pairs perfectly with iron-rich meals all week!",items:["dairy","sesame","egg"]}]},
{d:31,w:5,t:"Carrots",nf:"Carrots 🥕",nt:"Vitamin A",meals:[
{tm:"AM",n:"Steamed Carrots + Pancake + Salmon",r:"BATCH: Peel 4–5 WHOLE carrots. Steam WHOLE 15–20 min until completely fork-tender. NEVER serve raw. Cut into thick sticks. Save rest (Days 31-33). DEFROST PANCAKE. BAKE SALMON (→ Days 31, 33).",items:["carrots","peanut","egg","wheat","sesame","fish"]},
{tm:"PM",n:"Nut Yogurt + Mango + Bell Pepper leftovers",r:"Nut yogurt. Leftover mango and pepper — iron-boosting vitamin C combo!",items:["dairy","peanut"]}]},
{d:32,w:5,t:"Peas",nf:"Green Peas 🟢",nt:"🩸 Iron · Protein",meals:[
{tm:"AM",n:"Smashed Peas + Pancake",r:"Steam ½ cup frozen peas 5–6 min. Press EACH pea with fork to smash open. NEVER serve whole — choking hazard! DEFROST PANCAKE. BOIL SHRIMP (→ Days 32, 34). BOIL EGGS.",items:["peas","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Yogurt + Carrots + Shrimp",r:"Tahini yogurt. Leftover carrots. Shrimp puree.",items:["dairy","sesame","shellfish"]}]},
{d:33,w:5,t:"Spinach",nf:"Spinach 🥬",nt:"🩸 Iron (pair w/ Vit C!)",meals:[
{tm:"AM",n:"Spinach-Egg Scramble + Pancake + Salmon",r:"Wash 2 handfuls spinach. Steam 2–3 min. Squeeze water. Chop fine. Whisk 1 egg + spinach. Scramble 3–4 min. Cut strips. 🍊 Serve with leftover mango or bell pepper for iron+vitamin C pairing! DEFROST PANCAKE. Leftover salmon.",items:["spinach","egg","peanut","wheat","sesame","fish"]},
{tm:"PM",n:"Nut Yogurt + Peas + Tofu",r:"Nut yogurt. Leftover smashed peas. OPEN FRESH TOFU (→ Days 33, 35).",items:["dairy","peanut","soy"]}]},
{d:34,w:5,t:"Black Beans",nf:"Black Beans 🫘",nt:"🩸 Iron · Zinc · Protein",meals:[
{tm:"AM",n:"Mashed Beans + Pancake + Shrimp",r:"OPEN CAN (→ Days 34-35). Drain, rinse well. Mash ¼ cup — NO whole beans (choking). 🍊 Serve with leftover bell pepper strips for iron+vitamin C! DEFROST PANCAKE. Leftover shrimp.",items:["black_beans","peanut","egg","wheat","sesame","shellfish"]},
{tm:"PM",n:"Bean-Yogurt + Egg",r:"Stir beans into yogurt (sounds weird, tastes great). Egg strip.",items:["dairy","egg"]}]},
{d:35,w:5,t:"Corn",nf:"Corn on the Cob 🌽",nt:"Fiber · Fun texture",meals:[
{tm:"AM",n:"Corn Rounds + Pancake",r:"Shuck 1 ear corn. Cut into 3 thick rounds. Boil 8 min. Drain, cool. Gums mash kernels safely. Corn in diaper = normal! DEFROST PANCAKE.",items:["corn","peanut","egg","wheat","sesame"]},
{tm:"PM (Family!)",n:"Taco Night 🌮",r:"Family tacos! Tessa (BEFORE salt): leftover beans, tofu (Day 33, last day!), shredded chicken or egg strips, avocado. Nut yogurt. Corn rounds on side.",items:["dairy","soy","peanut"]}],fm:"Taco Night 🌮"},
// WEEK 6 — Bold Flavors
{d:36,w:6,t:"Blueberries",nf:"Blueberries 🫐",nt:"🍊 Vit C · Antioxidants",meals:[
{tm:"AM",n:"Smashed Blueberries + Pancake",r:"Wash berries. Press EACH with fork to smash flat. NEVER whole — choking! Mix into mashed pancake or serve on tray. DEFROST PANCAKE. BOIL EGGS. BOIL SHRIMP. 🥜 MAKE FRESH SIX-NUT BLEND + 🥞 FRESH PANCAKE BATCH.",items:["blueberries","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Blueberry Yogurt + Shrimp",r:"Smashed blueberries stirred into yogurt — vitamin C! Shrimp puree.",items:["dairy","sesame","shellfish"]}]},
{d:37,w:6,t:"Pear",nf:"Pear 🍐",nt:"🍊 Vit C · Fiber",meals:[
{tm:"AM",n:"Pear Spears + Pancake",r:"Very ripe: slice thick spears. Firm: peel, cut, steam 8–10 min. Finger food. DEFROST PANCAKE. OPEN TOFU (→ Days 37, 39).",items:["pear","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Nut Yogurt + Tofu + Pear",r:"Nut yogurt. Tofu mash. More pear spears for dessert.",items:["dairy","peanut","soy"]}]},
{d:38,w:6,t:"Cauliflower",nf:"Cauliflower 🥬",nt:"Vit C · Mild",meals:[
{tm:"AM",n:"Cauliflower Two Ways + Pancake + Salmon",r:"Steam 4–5 florets 10–12 min until VERY soft. Mash 2, serve 2–3 whole upright (stem = handle). DEFROST PANCAKE. BAKE SALMON (→ Days 38, 40).",items:["cauliflower","peanut","egg","wheat","sesame","fish"]},
{tm:"PM",n:"Tahini Yogurt + Pear + Carrots",r:"Tahini yogurt. Pear spears. Steam fresh carrots.",items:["dairy","sesame"]}]},
{d:39,w:6,t:"Beef",nf:"Beef 🥩",nt:"🩸🩸 Heme Iron · Zinc (richest!)",meals:[
{tm:"AM",n:"Slow-Cooked Beef + Pancake + Tofu",r:"SLOW-COOK: 1 lb stew beef in pot, cover water. Boil → low simmer 2–3 hrs until very tender. Shred thin. Save for Days 39–41. Beef is THE richest source of heme iron + zinc! DEFROST PANCAKE. Tofu (Day 37). BOIL EGGS.",items:["beef","peanut","egg","wheat","sesame","soy"]},
{tm:"PM",n:"Beef + Nut Yogurt + Broccoli",r:"Shredded beef. Nut yogurt. Steam broccoli — vitamin C boosts the already-excellent iron from beef!",items:["dairy","peanut"]}]},
{d:40,w:6,t:"Zucchini",nf:"Zucchini 🥒",nt:"Mild · Easy texture",meals:[
{tm:"AM",n:"Zucchini Spears + Pancake + Salmon",r:"Cut 1 zucchini into thick spears (skin on for grip). Steam 8–10 min until soft. Finger food. DEFROST PANCAKE. Leftover salmon.",items:["zucchini","peanut","egg","wheat","sesame","fish"]},
{tm:"PM",n:"Beef-Yogurt + Shrimp",r:"Shredded beef with nut yogurt. Leftover shrimp (or fresh batch).",items:["dairy","peanut","shellfish"]}]},
{d:41,w:6,t:"Butternut Squash",nf:"Butternut Squash 🎃",nt:"Vitamin A · Sweet carrier",meals:[
{tm:"AM",n:"Squash Two Ways + Pancake + Beef",r:"Peel small squash. Cut spears + cubes. Roast 400°F 20–25 min until fork-tender. Spears as finger food + mash cubes. Leftover beef. DEFROST PANCAKE. BOIL EGGS.",items:["butternut_squash","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Squash-Yogurt + Tahini",r:"Mashed squash stirred into yogurt — sweet carrier, like sweet potato. Tahini drizzle.",items:["dairy","sesame"]}]},
{d:42,w:6,t:"Peach",nf:"Peach 🍑",nt:"🍊 Vit C",meals:[
{tm:"AM",n:"Peach Strips + Pancake",r:"Ripe peach strips. To peel: score X on bottom, blanch 30 sec, skin slides off. DEFROST PANCAKE. OPEN TOFU (→ Days 42, 44).",items:["peach","peanut","egg","wheat","sesame"]},
{tm:"PM (Family!)",n:"Squash Soup Night 🍲",r:"Butternut squash soup for family! Tessa: squash mash (Day 41 leftovers), shredded beef, tahini yogurt, shrimp puree, tofu.",items:["dairy","sesame","shellfish","soy"]}],fm:"Squash Soup Night 🍲"},
// WEEK 7 — Complex Foods
{d:43,w:7,t:"Chickpeas",nf:"Chickpeas 🥫",nt:"🩸 Iron · Protein",meals:[
{tm:"AM",n:"Hummus + Bell Pepper + Pancake",r:"MAKE HUMMUS: Drain 1 can chickpeas. Blend with 2 tbsp olive oil, ½ lemon juice, 2 tbsp tahini, ¼ cup water until smooth. Roast pepper (Day 30 method) for dipping. Save hummus 3 days. 🍊 Pepper + chickpeas = iron + vitamin C! DEFROST PANCAKE. BAKE SALMON (→ Days 43, 46). BOIL EGGS.",items:["chickpeas","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Egg + Yogurt + Salmon",r:"Egg strip. Yogurt. Salmon mash.",items:["dairy","fish"]}]},
{d:44,w:7,t:"Tomato",nf:"Tomato 🍅",nt:"🍊 Vit C (barrier cream!)",meals:[
{tm:"AM",n:"Tomato Wedges + Pancake + Tofu",r:"Cut ripe tomato thick wedges. Apply barrier cream around mouth BEFORE (acid = harmless contact rash). DEFROST PANCAKE. Tofu (Day 42). OPEN FRESH TOFU (→ Days 44, 46).",items:["tomato","peanut","egg","wheat","sesame","soy"]},
{tm:"PM",n:"Hummus + Yogurt + Carrots",r:"Leftover hummus. Nut yogurt. Steam fresh carrots for dipping.",items:["dairy","peanut"]}]},
{d:45,w:7,t:"Artichoke",nf:"Artichoke Hearts 🌿",nt:"Fiber · Unique flavor",meals:[
{tm:"AM",n:"Artichoke + Pancake + Shrimp",r:"Canned/jarred artichoke hearts (in water, NOT marinated). Drain, rinse. Steam 5 min. Cut thick strips. DEFROST PANCAKE. BOIL SHRIMP (→ Days 45, 47).",items:["artichoke","peanut","egg","wheat","sesame","shellfish"]},
{tm:"PM",n:"Nut Yogurt + Tomato + Avocado",r:"Nut yogurt. Tomato wedges (barrier cream!). Avocado half.",items:["dairy","peanut"]}]},
{d:46,w:7,t:"Rice",nf:"Rice 🍚",nt:"Gentle grain",meals:[
{tm:"AM",n:"Rice Porridge + Nut Blend + Salmon",r:"COOK RICE (→ Days 46-47): Rinse ½ cup rice. Cook 1½ cups water, boil → low → cover 18–20 min. Mash slightly. Swirl in nut blend + tahini. Salmon from Day 43. BOIL EGGS.",items:["rice","peanut","sesame","fish"]},
{tm:"PM",n:"Rice + Egg + Yogurt + Tofu",r:"Leftover rice. Egg strip. Yogurt. Tofu (Day 44).",items:["egg","dairy","soy"]}]},
{d:47,w:7,t:"Polenta",nf:"Polenta 🌽",nt:"Creamy · Iron-fortified",meals:[
{tm:"AM",n:"Creamy Polenta + Pancake",r:"Boil 2 cups water. Whisk in ½ cup polenta slowly. Low heat, stir 15–20 min. Add 1 tbsp butter + 2 tbsp milk. Scoop onto tray + preloaded spoon. DEFROST PANCAKE. SLOW-COOK CHICKEN (→ Days 47-48).",items:["polenta","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Chicken + Yogurt + Shrimp + Rice",r:"Shredded chicken. Yogurt. Leftover shrimp. Leftover rice.",items:["dairy","shellfish"]}]},
{d:48,w:7,t:"Corn Tortilla",nf:"Corn Tortilla 🫓",nt:"Whole grain · Fun",meals:[
{tm:"AM",n:"Mini Breakfast Tacos + Pancake",r:"Warm 2 corn tortillas in dry pan 30 sec each side. Cut into 2-finger strips. Scramble 1 egg, place on strips. Avocado mash on top. DEFROST PANCAKE. BAKE SALMON (→ Days 48, 50).",items:["corn_tortilla","egg","peanut","wheat","sesame"]},
{tm:"PM",n:"Chicken + Salmon + Tahini Yogurt",r:"Shredded chicken (Day 47). Salmon. Tahini yogurt.",items:["dairy","fish","sesame"]}]},
{d:49,w:7,t:"Kidney Beans",nf:"Kidney Beans 🫘",nt:"🩸 Iron · Protein",meals:[
{tm:"AM",n:"Mashed Kidney Beans + Pancake",r:"OPEN CAN (→ Days 49-50). Drain, rinse. Mash thoroughly. 🍊 Serve with leftover bell pepper or tomato for iron+vitamin C! DEFROST PANCAKE. BOIL EGGS. OPEN TOFU (→ Days 49, 51).",items:["kidney_beans","peanut","egg","wheat","sesame"]},
{tm:"PM (Family!)",n:"Taco Night 🌮",r:"Family tacos! Tessa: corn tortilla strips, beans, chicken, avocado, yogurt. Shrimp puree. Tofu.",items:["dairy","shellfish","soy"]}],fm:"Taco Night 🌮"},
// WEEK 8 — Finishing Strong!
{d:50,w:8,t:"Pumpkin Seeds",nf:"Pumpkin Seeds 🎃",nt:"🩸 Iron · Zinc",meals:[
{tm:"AM",n:"Pumpkin Seed Sprinkle + Pancake + Salmon",r:"Grind 1 tbsp raw pumpkin seeds in spice grinder to fine powder (no chunks!). Sprinkle on mashed pancake + leftover beans. Iron + zinc boost — like hemp seeds! DEFROST PANCAKE. BAKE SALMON (→ Days 50, 52). 🥜 MAKE FRESH NUT BLEND + 🥞 PANCAKE BATCH (final!).",items:["pumpkin_seeds","peanut","egg","wheat","sesame","fish"]},
{tm:"PM",n:"Nut Yogurt + Banana",r:"Nut yogurt with pumpkin seed sprinkle + hemp seeds. Banana.",items:["dairy","peanut"]}]},
{d:51,w:8,t:"Crispy Tofu",nf:"Crispy Tofu 🧊",nt:"Protein · New texture",meals:[
{tm:"AM",n:"Pan-Fried Tofu Strips + Pancake",r:"Press FIRM tofu with paper towels. Cut thick strips. Heat 1 tbsp oil medium. Fry 3–4 min each side until golden. Cool. Finger food! DEFROST PANCAKE. BOIL SHRIMP (→ Days 51, 53).",items:["crispy_tofu","soy","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Yogurt + Kidney Beans + Shrimp",r:"Tahini yogurt. Leftover beans (Day 49, last day). Shrimp puree.",items:["dairy","sesame","shellfish"]}]},
{d:52,w:8,t:"Chayote",nf:"Chayote 🥒",nt:"Mild · Vitamin C",meals:[
{tm:"AM",n:"Steamed Chayote + Pancake + Salmon",r:"Peel chayote, halve, remove seed. Cut spears. Steam 12–15 min. Finger food. DEFROST PANCAKE. Leftover salmon.",items:["chayote","peanut","egg","wheat","sesame","fish"]},
{tm:"PM",n:"Nut Yogurt + Egg",r:"Nut yogurt. Egg strip with hemp seed sprinkle.",items:["dairy","peanut"]}]},
{d:53,w:8,t:"Cinnamon",nf:"Cinnamon 🫙",nt:"Anti-inflammatory",meals:[
{tm:"AM",n:"Cinnamon-Apple Pancake",r:"Peel 1 apple, cut wedges. Steam 10 min. Mash. DEFROST PANCAKE: mash with breast milk + mashed apple + pinch cinnamon. Warm, cozy! COOK LENTILS (→ Days 53-55). BOIL EGGS. BOIL SHRIMP. OPEN TOFU (→ Days 53, 55).",items:["cinnamon","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Lentil Yogurt + Tofu + Shrimp",r:"Lentils stirred into tahini yogurt. Tofu mash. Shrimp puree. 🍊 Serve with leftover bell pepper or mango for iron+vitamin C!",items:["dairy","sesame","soy","shellfish"]}]},
{d:54,w:8,t:"Cumin",nf:"Cumin 🫙",nt:"Digestive · Savory",meals:[
{tm:"AM",n:"Cumin-Lentil Mash + Pancake + Salmon",r:"Leftover lentils with pinch cumin — savory! DEFROST PANCAKE. BAKE SALMON.",items:["cumin","peanut","egg","wheat","sesame","fish"]},
{tm:"PM",n:"Yogurt + Beef + Carrots",r:"Tahini yogurt. SLOW-COOK BEEF (→ Days 54-56). Steam fresh carrots.",items:["dairy","sesame"]}]},
{d:55,w:8,t:"Paprika",nf:"Paprika 🫙",nt:"Vitamin A · Mild spice",meals:[
{tm:"AM",n:"Paprika Egg Scramble + Pancake",r:"Whisk 1 egg + tiny pinch sweet (NOT hot!) paprika. Scramble. DEFROST PANCAKE. Leftover lentils (last day of batch).",items:["paprika","peanut","egg","wheat","sesame"]},
{tm:"PM",n:"Beef-Lentil + Yogurt + Tofu + Shrimp",r:"Shredded beef + cumin lentils. Tahini yogurt. Tofu (Day 53, last day). BOIL SHRIMP. Shrimp puree.",items:["dairy","sesame","soy","shellfish"]}]},
{d:56,w:8,t:"🎉 Celebration Day!",nf:null,meals:[
{tm:"AM (Family Brunch!)",n:"Greatest Hits Brunch 🎊",r:"Cinnamon-allergen pancake with hemp + pumpkin seed sprinkle. Paprika egg strips. Blueberry yogurt. Avocado half. WHOLE FAMILY eats together!",items:["egg","dairy","peanut","wheat","sesame"]},
{tm:"PM",n:"All-Allergen Celebration Bowl 🏆",r:"Salmon mash. Shrimp puree. Crispy tofu strips. Cumin lentils. Beef. Steamed veggies. Every allergen represented. 8 WEEKS COMPLETE! 🎉🎊🥳",items:["fish","shellfish","soy"]}],fm:"Celebration Brunch 🎉"},
];

function groc(w){const g={"🥚 Dairy & Eggs":new Set(),"🥜 Nut Butters":new Set(),"🫙 Pantry":new Set(),"🥬 Produce":new Set(),"🥩 Protein":new Set(),"🌱 Seeds & Spices":new Set()};const a=(c,i)=>g[c]?.add(i);
if(w<=3){W13.filter(d=>d.w===w).forEach(d=>d.items.forEach(it=>{const f=it.food;if(f==="egg")a("🥚 Dairy & Eggs","Large eggs (dozen)");if(f==="dairy")a("🥚 Dairy & Eggs","Plain whole milk yogurt");if(f==="peanut")a("🥜 Nut Butters","Smooth peanut butter");if(f==="almond")a("🥜 Nut Butters","Smooth almond butter");if(f==="walnut")a("🥜 Nut Butters","Walnut butter (or raw walnuts)");if(f==="hazelnut")a("🥜 Nut Butters","Hazelnut butter (or raw hazelnuts)");if(f==="pistachio")a("🥜 Nut Butters","Pistachio butter (or raw pistachios)");if(f==="pecan")a("🥜 Nut Butters","Pecan butter (or raw pecans)");if(f==="sesame")a("🌱 Seeds & Spices","Tahini");if(f==="wheat"){a("🫙 Pantry","Iron-fortified wheat cereal");a("🫙 Pantry","Whole wheat flour");}if(f==="fish")a("🥩 Protein","Salmon (2 fillets, skin-on)");if(f==="shellfish")a("🥩 Protein","Medium shrimp (6-8, raw)");if(f==="soy")a("🥩 Protein","Silken tofu");}));a("🫙 Pantry","Breast milk or formula");
}else{a("🥚 Dairy & Eggs","Large eggs (dozen)");a("🥚 Dairy & Eggs","Whole milk yogurt");a("🥜 Nut Butters","Six-nut blend (see recipe)");a("🌱 Seeds & Spices","Tahini");a("🌱 Seeds & Spices","Hemp seeds");a("🫙 Pantry","Whole wheat flour (for pancakes)");a("🫙 Pantry","Olive oil");a("🫙 Pantry","Unsalted butter");
W48.filter(d=>d.w===w).forEach(d=>{if(d.nf)a("🥬 Produce",d.nf);d.meals?.forEach(m=>(m.items||[]).forEach(x=>{if(x==="fish")a("🥩 Protein","Salmon (2 fillets)");if(x==="shellfish")a("🥩 Protein","Shrimp (6-8)");if(x==="soy"||x==="crispy_tofu")a("🥩 Protein","Tofu (silken + firm)");if(x==="chicken")a("🥩 Protein","Chicken drumsticks (2)");if(x==="beef")a("🥩 Protein","Stew beef (1 lb)");if(x==="black_beans"||x==="kidney_beans")a("🫙 Pantry","Canned beans");if(x==="lentils")a("🫙 Pantry","Red lentils");if(x==="chickpeas")a("🫙 Pantry","Canned chickpeas");if(x==="rice")a("🫙 Pantry","White rice");if(x==="corn_tortilla")a("🫙 Pantry","Corn tortillas");if(x==="polenta")a("🫙 Pantry","Polenta/cornmeal");if(x==="pumpkin_seeds")a("🌱 Seeds & Spices","Raw pumpkin seeds");if(x==="cinnamon")a("🌱 Seeds & Spices","Ground cinnamon");if(x==="cumin")a("🌱 Seeds & Spices","Ground cumin");if(x==="paprika")a("🌱 Seeds & Spices","Sweet paprika");}));});}
return Object.entries(g).filter(([,v])=>v.size>0).map(([c,v])=>({cat:c,items:[...v].sort()}));}

export default function TessaFirstBites(){
const[week,setWeek]=useState(1);
const[selDay,setSelDay]=useState(null);
const[tab,setTab]=useState("plan");
const[checks,setChecks]=useState({});
const[foodLog,setFoodLog]=useState({});
const[activeWeek,setActiveWeek]=useState(1);
const[loaded,setLoaded]=useState(false);
const[saveMsg,setSaveMsg]=useState("");
const[showBackup,setShowBackup]=useState(false);
const[importText,setImportText]=useState("");
const saveTimer=useRef(null);

// Firebase real-time sync — loads data AND listens for changes from other devices
useEffect(()=>{
  const dataRef=ref(db,"tessa-app/state");
  const unsub=onValue(dataRef,(snapshot)=>{
    const d=snapshot.val();
    if(d){
      if(d.checks)setChecks(d.checks);
      if(d.foodLog)setFoodLog(d.foodLog);
      if(d.activeWeek)setActiveWeek(d.activeWeek);
      if(d.week)setWeek(d.week);
      if(!loaded)setSaveMsg("✅");
    }
    setLoaded(true);
  },(error)=>{
    console.error("Firebase read error:",error);
    setLoaded(true);
  });
  return()=>unsub();
},[]);

// Auto-save to Firebase, debounced
const saveState=useCallback((c,f,aw,w)=>{
  if(saveTimer.current)clearTimeout(saveTimer.current);
  saveTimer.current=setTimeout(()=>{
    set(ref(db,"tessa-app/state"),{checks:c,foodLog:f,activeWeek:aw,week:w})
      .then(()=>setSaveMsg("💾"))
      .catch(()=>setSaveMsg("⚠️"));
  },500);
},[]);

useEffect(()=>{
  if(!loaded)return;
  saveState(checks,foodLog,activeWeek,week);
},[checks,foodLog,activeWeek,week,loaded,saveState]);

// Backup export/import
const exportData=()=>btoa(unescape(encodeURIComponent(JSON.stringify({c:checks,f:foodLog,a:activeWeek,w:week}))));
const doImport=(str)=>{
  try{
    const d=JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
    if(d.c)setChecks(d.c);if(d.f)setFoodLog(d.f);if(d.a)setActiveWeek(d.a);if(d.w)setWeek(d.w);
    setSaveMsg("✅ Restored!");setShowBackup(false);setImportText("");
  }catch(e){setSaveMsg("❌ Invalid code");}
};

const RXNS=["😍","😐","😖","🚫"];
const RXL={"😍":"Loved","😐":"Neutral","😖":"Disliked","🚫":"Refused"};
const RXC={"😍":C.green,"😐":C.gold,"😖":C.accent,"🚫":C.red};
// Storage uses codes 1-4 instead of emoji to avoid encoding issues
const RX_TO_CODE={"😍":"1","😐":"2","😖":"3","🚫":"4"};
const CODE_TO_RX={"1":"😍","2":"😐","3":"😖","4":"🚫"};

const setRxn=useCallback((k,r)=>{setChecks(p=>{const n={...p};const code=RX_TO_CODE[r];n[k]===code?delete n[k]:n[k]=code;return n;});},[]);
const getRxn=(k)=>CODE_TO_RX[checks[k]]||null;
const logF=useCallback((f,d)=>{setFoodLog(p=>({...p,[f]:Math.max(0,(p[f]||0)+d)}));},[]);

const isAW=week<=3;
const days=useMemo(()=>isAW?W13.filter(d=>d.w===week):W48.filter(d=>d.w===week),[week,isAW]);
const gl=useMemo(()=>groc(week),[week]);

const aExp=useMemo(()=>{
  const c={};Object.keys(ALL).forEach(a=>{c[a]={t:0,w:0};});
  W13.forEach(d=>d.items.forEach((it,i)=>{if(checks[`${d.d}-${i}`]&&ALL[it.food]){c[it.food].t++;if(d.w===week)c[it.food].w++;}}));
  W48.forEach(d=>d.meals.forEach((m,mi)=>(m.items||[]).forEach((it,ii)=>{if(checks[`${d.d}-${mi}-${ii}`]&&ALL[it]){c[it].t++;if(d.w===week)c[it].w++;}})));
  return c;
},[checks,week]);

const rxnCounts=useMemo(()=>{
  const rc={};Object.keys(ALL).forEach(a=>{rc[a]={"1":0,"2":0,"3":0,"4":0};});
  W13.forEach(d=>d.items.forEach((it,i)=>{const r=checks[`${d.d}-${i}`];if(r&&ALL[it.food])rc[it.food][r]++;}));
  W48.forEach(d=>d.meals.forEach((m,mi)=>(m.items||[]).forEach((it,ii)=>{const r=checks[`${d.d}-${mi}-${ii}`];if(r&&ALL[it])rc[it][r]++;})));
  return rc;
},[checks]);

const doneDays=useMemo(()=>{
  const s=new Set();
  W13.forEach(d=>{if(d.items.every((_,i)=>checks[`${d.d}-${i}`]))s.add(d.d);});
  W48.forEach(d=>{if(d.meals.every((m,mi)=>(m.items||[]).every((_,ii)=>checks[`${d.d}-${mi}-${ii}`])))s.add(d.d);});
  return s;
},[checks]);
const pct=Math.round((doneDays.size/56)*100);
const nf=useMemo(()=>W48.filter(d=>d.nf).map(d=>({day:d.d,name:d.nf,w:d.w})),[]);

const st={
wrap:{fontFamily:C.sans,background:C.bg,color:C.text,minHeight:"100vh",maxWidth:520,margin:"0 auto"},
hdr:{background:C.hdr,color:C.hdrText,padding:"28px 20px 24px",textAlign:"center"},
h1:{fontFamily:C.serif,fontSize:26,fontWeight:700,margin:"0 0 2px",letterSpacing:"-0.3px"},
sub:{fontSize:13,opacity:.65,margin:0},
tabs:{display:"flex",justifyContent:"center",gap:4,padding:"14px 12px 0",flexWrap:"wrap"},
tabB:(a)=>({padding:"7px 14px",borderRadius:20,border:"none",background:a?C.green:"transparent",color:a?"#fff":C.muted,fontFamily:C.sans,fontSize:12,fontWeight:a?600:500,cursor:"pointer"}),
wkR:{display:"flex",gap:4,padding:"10px 16px",overflowX:"auto"},
wkB:(a,live)=>({padding:"9px 12px",borderRadius:C.rs,border:a?"none":`1px solid ${live?C.border:C.border+"88"}`,background:a?(isAW?C.accent:C.green):C.card,color:a?"#fff":live?C.text:C.muted,fontFamily:C.sans,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",boxShadow:a?C.shadowMd:"none",opacity:live||a?1:.5}),
sum:{margin:"0 16px 10px",padding:"12px 14px",background:isAW?C.accentLt:C.greenLt,borderRadius:C.rs,fontSize:13,lineHeight:1.5,color:C.warm,borderLeft:`3px solid ${isAW?C.accent:C.green}`},
body:{padding:"0 16px 32px"},
card:(sel,dn)=>({background:dn?"#FAFDF9":C.card,borderRadius:C.r,padding:"14px 16px",marginBottom:8,cursor:"pointer",border:sel?`2px solid ${C.accent}`:`1px solid ${dn?C.green+"44":C.border}`,boxShadow:sel?C.shadowMd:C.shadow}),
dayL:{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:.5},
dayT:{fontFamily:C.serif,fontSize:16,fontWeight:600,margin:"2px 0 0"},
pills:{display:"flex",flexWrap:"wrap",gap:3,marginTop:6},
pill:(col,nw)=>({display:"inline-flex",alignItems:"center",gap:2,padding:"2px 7px",borderRadius:10,fontSize:10,fontWeight:600,background:nw?C.redLt:`${col}22`,color:nw?C.red:C.warm,border:nw?`1px solid ${C.red}33`:"none"}),
det:{background:C.card,borderRadius:C.r,padding:"18px",marginTop:4,marginBottom:12,border:`1px solid ${C.border}`,boxShadow:C.shadowMd},
secH:{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,color:C.accent,marginBottom:6},
secB:{fontSize:13,lineHeight:1.6,color:C.warm},
eduC:(bg,c)=>({padding:"12px 14px",borderRadius:C.rs,background:bg,borderLeft:`3px solid ${c}`,marginBottom:8}),
eduT:{fontSize:13,fontWeight:700,marginBottom:4},
eduX:{fontSize:12,lineHeight:1.5,color:C.warm},
rxnRow:{display:"flex",gap:4,marginTop:4},
rxnBtn:(a,c)=>({width:32,height:32,borderRadius:8,border:a?`2px solid ${c}`:`1.5px solid ${C.border}`,background:a?`${c}18`:C.card,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,opacity:a?1:.5,transition:"all .15s",boxShadow:a?`0 0 0 1px ${c}33`:"none"}),
mealC:{background:"#FAFAF7",borderRadius:C.rs,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`},
mealTm:{fontSize:10,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:.5},
mealN:{fontFamily:C.serif,fontSize:14,fontWeight:600,margin:"2px 0 6px"},
pBar:{width:"100%",height:10,borderRadius:5,background:C.border,overflow:"hidden",marginBottom:6},
pFill:(p)=>({width:`${p}%`,height:"100%",background:`linear-gradient(90deg,${C.accent},${C.green})`,borderRadius:5,transition:"width .3s"}),
trkR:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`},
badge:(c)=>({padding:"2px 8px",borderRadius:10,background:c,fontSize:11,fontWeight:600}),
ctrB:{width:24,height:24,borderRadius:12,border:`1px solid ${C.border}`,background:C.card,cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",color:C.warm},
ntBadge:{display:"inline-flex",padding:"3px 8px",borderRadius:10,background:"#F0EDE8",fontSize:10,color:C.warm,marginLeft:6},
};

const Pill=({a,d})=>{const al=ALL[a];if(!al)return null;const nw=isIntro(a,d);return <span style={st.pill(al.c,nw)}>{al.e} {al.n}{nw?" ★":""}</span>;};
const allAForDay=(d)=>{
  if(d.items)return d.items.map(it=>it.food).filter(f=>ALL[f]);
  if(d.meals)return[...new Set(d.meals.flatMap(m=>(m.items||[]).filter(f=>ALL[f])))];return[];};

if(!loaded)return(<div style={{...st.wrap,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:32,marginBottom:8}}>🌱</div><div style={{fontSize:14}}>Loading Tessa's data...</div></div></div>);

return (
<div style={st.wrap}>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<div style={st.hdr}>
<h1 style={st.h1}>🌱 Tessa's First Bites</h1>
<p style={st.sub}>8-Week Solid Starts + Accelerated Allergen Plan {saveMsg&&<span style={{fontSize:10}}>{saveMsg}</span>}</p>
<button style={{marginTop:6,padding:"3px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:C.hdrText,fontSize:10,cursor:"pointer"}} onClick={()=>setShowBackup(!showBackup)}>{showBackup?"Hide Backup":"📋 Backup"}</button>
</div>
{showBackup&&<div style={{margin:"0 16px 8px",padding:12,background:C.card,borderRadius:C.rs,border:`1px solid ${C.border}`,fontSize:12}}>
<div style={{fontWeight:700,marginBottom:6}}>📋 Backup & Restore</div>
<div style={{color:C.muted,fontSize:11,marginBottom:8}}>Auto-save works within the same artifact. If you open a newer version, paste your backup code to restore.</div>
<div style={{marginBottom:8}}>
<div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:3}}>Your backup code:</div>
<textarea readOnly value={exportData()} style={{width:"100%",height:44,fontSize:9,fontFamily:"monospace",padding:6,borderRadius:4,border:`1px solid ${C.border}`,background:"#f8f8f5",resize:"none",boxSizing:"border-box"}} onClick={(e)=>{e.target.select();try{navigator.clipboard.writeText(e.target.value);setSaveMsg("📋 Copied!");}catch(ex){document.execCommand("copy");setSaveMsg("📋 Copied!");}}}/>
<div style={{fontSize:9,color:C.muted}}>Tap to copy</div></div>
<div>
<div style={{fontSize:11,fontWeight:600,color:C.accent,marginBottom:3}}>Restore from code:</div>
<textarea value={importText} onChange={(e)=>setImportText(e.target.value)} placeholder="Paste backup code..." style={{width:"100%",height:44,fontSize:9,fontFamily:"monospace",padding:6,borderRadius:4,border:`1px solid ${C.border}`,resize:"none",boxSizing:"border-box"}}/>
<button style={{marginTop:4,padding:"4px 12px",borderRadius:C.rs,border:"none",background:C.green,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}} onClick={()=>doImport(importText)}>Restore</button></div>
</div>}

<div style={st.tabs}>
{[["plan","📅 Plan"],["tracker","📊 Tracker"],["prep","🍳 Meal Prep"],["grocery","🛒 Grocery"],["tips","💡 Tips"]].map(([k,l])=>(
<button key={k} style={st.tabB(tab===k)} onClick={()=>setTab(k)}>{l}</button>))}
</div>

<div style={st.wkR}>
{[1,2,3,4,5,6,7,8].map(w=>{const live=w<=activeWeek;
return <button key={w} style={st.wkB(week===w,live)} onClick={()=>{setWeek(w);setSelDay(null);}}>{w<=3?"🔴":"🟢"} Wk {w}</button>;})}
</div>

<div style={st.sum}>
<strong>{WI[week].t}</strong> — {WI[week].s}
{week>activeWeek&&<div style={{marginTop:6,fontSize:12,color:C.muted,fontStyle:"italic"}}>🔒 This week hasn't started yet. Tap the current week to mark it active.</div>}
</div>

{/* Week summary */}
{tab==="plan"&&<div style={{margin:"0 16px 12px",padding:"14px",background:C.card,borderRadius:C.r,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
<div style={{fontFamily:C.serif,fontSize:14,fontWeight:700,marginBottom:6,color:isAW?C.accent:C.green}}>Week {week} Overview</div>
<div style={{fontSize:12,lineHeight:1.6,color:C.warm}}>{WI[week].sum}</div>
{week>activeWeek&&<button style={{marginTop:8,padding:"6px 14px",borderRadius:C.rs,border:"none",background:C.green,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}} onClick={()=>setActiveWeek(week)}>Start Week {week}</button>}
{week===activeWeek&&week<8&&<button style={{marginTop:8,padding:"6px 14px",borderRadius:C.rs,border:"none",background:C.green+"22",color:C.green,fontSize:12,fontWeight:600,cursor:"pointer"}} onClick={()=>setActiveWeek(week+1)}>Mark Week {week} Complete →</button>}
</div>}

<div style={st.body}>

{/* ═══ PLAN TAB ═══ */}
{tab==="plan"&&days.map(d=>{
const dn=doneDays.has(d.d);
const allA=allAForDay(d);
const dayRxns=[];
if(d.items)d.items.forEach((_,i)=>{const r=getRxn(`${d.d}-${i}`);if(r)dayRxns.push(r);});
if(d.meals)d.meals.forEach((m,mi)=>(m.items||[]).forEach((_,ii)=>{const r=getRxn(`${d.d}-${mi}-${ii}`);if(r)dayRxns.push(r);}));
const rxnS=dayRxns.length>0?dayRxns.join(""):null;
return(<div key={d.d}>
<div style={st.card(selDay===d.d,dn)} onClick={()=>setSelDay(selDay===d.d?null:d.d)}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
<div><div style={st.dayL}>Day {d.d} · {dayDate(d.d)}{d.fm?" · 👨‍👩‍👧":""}{dn?" · ✅":""}</div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={st.dayT}>{d.t}</span>{d.nt&&<span style={st.ntBadge}>{d.nt}</span>}</div>{rxnS&&<div style={{fontSize:12,marginTop:2,letterSpacing:1}}>{rxnS}</div>}</div>
<span style={{fontSize:18,color:C.muted}}>{selDay===d.d?"▾":"▸"}</span>
</div>
<div style={st.pills}>{allA.map(a=><Pill key={a} a={a} d={d.d}/>)}</div>
</div>

{selDay===d.d&&isAW&&(<div style={st.det}>
{d.items.map((it,i)=>{const key=`${d.d}-${i}`;const rxn=getRxn(key);const ck=!!rxn;const al=ALL[it.food];
return(<div key={i} style={{marginBottom:16,paddingBottom:i<d.items.length-1?16:0,borderBottom:i<d.items.length-1?`1px solid ${C.border}`:"none"}}>
<div style={{marginBottom:ck?0:10}}>
<div style={{fontSize:14,fontWeight:600,color:ck?RXC[rxn]:C.text,marginBottom:4}}>{al?.e} {it.r.n}</div>
<div style={st.rxnRow}>{RXNS.map(r=>(
<div key={r} style={st.rxnBtn(rxn===r,RXC[r])} onClick={(e)=>{e.stopPropagation();setRxn(key,r);}}>{r}</div>
))}<span style={{fontSize:10,color:C.muted,alignSelf:"center",marginLeft:4}}>{rxn?RXL[rxn]:"Tap to log"}</span></div></div>
{!ck&&(<>
<div style={{fontSize:12,color:C.muted,marginBottom:10}}>⏱ {it.r.tm}</div>
<div style={{marginBottom:10}}><div style={st.secH}>Ingredients</div><div style={st.secB}>{it.r.ing.join(" · ")}</div></div>
<div style={{marginBottom:10}}><div style={st.secH}>Step-by-Step</div>
{it.r.steps.map((s,j)=><div key={j} style={{...st.secB,marginBottom:5,paddingLeft:24,position:"relative"}}><span style={{position:"absolute",left:0,fontWeight:700,color:C.accent}}>{j+1}.</span>{s}</div>)}</div>
<div style={{marginBottom:10}}><div style={st.secH}>Storage</div><div style={st.secB}>{it.r.store}</div></div>
{it.r.mod&&<div style={{marginBottom:10}}><div style={st.secH}>Notes</div><div style={st.secB}>{it.r.mod}</div></div>}
</>)}
</div>);})}
{(d.edu||[]).map(k=>{const e=EDU[k];return e?<div key={k} style={st.eduC(e.bg,e.c)}><div style={st.eduT}>{e.i} {e.t}</div><div style={st.eduX}>{e.x}</div></div>:null;})}
</div>)}

{selDay===d.d&&!isAW&&(<div style={st.det}>
{d.nf&&<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:12,background:C.greenLt,color:C.green,fontSize:12,fontWeight:600,marginBottom:8}}>🌟 New: {d.nf}</span>}
{d.nt&&<span style={{display:"inline-flex",padding:"4px 10px",borderRadius:12,background:"#F0EDE8",fontSize:11,color:C.warm,marginBottom:8,marginLeft:6}}>{d.nt}</span>}
{d.fm&&<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:12,background:C.purpleLt,color:C.purple,fontSize:12,fontWeight:600,marginBottom:8,marginLeft:6}}>👨‍👩‍👧 {d.fm}</span>}
{d.meals.map((m,mi)=>(
<div key={mi} style={st.mealC}>
<div style={st.mealTm}>{m.tm}</div>
<div style={st.mealN}>{m.n}</div>
<div style={{fontSize:12,lineHeight:1.55,color:C.warm,marginBottom:8}}>{m.r}</div>
<div style={{borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:4}}>
<div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:6}}>LOG EACH FOOD:</div>
{(m.items||[]).map((it,ii)=>{const key=`${d.d}-${mi}-${ii}`;const rxn=getRxn(key);const al=ALL[it];const label=al?`${al.e} ${al.n}`:it.replace(/_/g," ");
return(<div key={ii} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:ii<(m.items||[]).length-1?`1px solid ${C.border}11`:"none"}}>
<span style={{fontSize:12,color:rxn?RXC[rxn]:C.warm,fontWeight:rxn?600:400}}>{label}{rxn?` ${rxn}`:""}</span>
<div style={{display:"flex",gap:3}}>{RXNS.map(r=>(
<div key={r} style={{...st.rxnBtn(rxn===r,RXC[r]),width:26,height:26,fontSize:14}} onClick={(e)=>{e.stopPropagation();setRxn(key,r);}}>{r}</div>
))}</div>
</div>);})}
</div></div>))}
{(d.edu2||[]).map(k=>{const e=EDU[k];return e?<div key={k} style={st.eduC(e.bg,e.c)}><div style={st.eduT}>{e.i} {e.t}</div><div style={st.eduX}>{e.x}</div></div>:null;})}
{d.d===56&&<div style={{...st.eduC(C.greenLt,C.green),textAlign:"center",marginTop:12}}><div style={{fontSize:24}}>🎉🎊🥳</div><div style={{...st.eduT,fontSize:16}}>8 Weeks Complete!</div><div style={st.eduX}>Tessa has tried all 13 allergens and 35+ foods!</div></div>}
</div>)}
</div>);})}

{/* ═══ TRACKER TAB ═══ */}
{tab==="tracker"&&(<>
<div style={{marginBottom:20}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
<div style={{fontFamily:C.serif,fontSize:16,fontWeight:700}}>Overall Progress</div>
<div style={{fontSize:13,color:C.muted,fontWeight:600}}>{doneDays.size}/56 days ({pct}%)</div></div>
<div style={st.pBar}><div style={st.pFill(pct)}/></div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
{[1,2,3,4,5,6,7,8].map(w=>{const wd=(w<=3?W13:W48).filter(d=>d.w===w);const wdn=wd.filter(d=>doneDays.has(d.d)).length;
return <span key={w} style={{textAlign:"center",flex:1}}>Wk{w}<br/>{wdn}/{wd.length}</span>;})}</div></div>
<div style={{fontFamily:C.serif,fontSize:16,fontWeight:700,marginBottom:10}}>Allergen Exposures</div>
{Object.entries(ALL).map(([k,v])=>{const e=aExp[k];const intro=SCH[k]?.[0];const introd=Object.keys(checks).some(ck=>ck.startsWith(`${intro}-`)&&checks[ck]);
return(<div key={k} style={st.trkR}>
<div style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}><span>{v.e}</span><span>{v.n}</span>
{!introd&&intro&&<span style={{fontSize:10,color:C.muted}}>Day {intro}</span>}
{introd&&<span style={{fontSize:10,color:C.green}}>✓</span>}</div>
<div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>{["1","2","3","4"].map(code=>{const cnt=rxnCounts[k]?.[code]||0;if(!cnt)return null;const em=CODE_TO_RX[code];return <span key={code} style={{fontSize:11,color:RXC[em],fontWeight:600}}>{em}{cnt}</span>;})}<span style={st.badge(C.accentLt)}>Wk:{e.w}</span><span style={st.badge(C.greenLt)}>Tot:{e.t}</span></div>
</div>);})}
<div style={{fontFamily:C.serif,fontSize:16,fontWeight:700,marginTop:20,marginBottom:4}}>New Foods (Weeks 4–8)</div>
<div style={{fontSize:12,color:C.muted,marginBottom:10}}>Track times consumed using + and −</div>
{nf.map(f=>{const c=foodLog[f.name]||0;
return(<div key={f.name} style={st.trkR}>
<div style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}><span>{f.name}</span><span style={{fontSize:10,color:C.muted}}>Day {f.day}</span></div>
<div style={{display:"flex",alignItems:"center",gap:4}}>
<button style={st.ctrB} onClick={()=>logF(f.name,-1)}>−</button>
<span style={{fontSize:13,fontWeight:600,minWidth:20,textAlign:"center"}}>{c}</span>
<button style={st.ctrB} onClick={()=>logF(f.name,1)}>+</button></div></div>);})}
</>)}

{/* ═══ MEAL PREP TAB ═══ */}
{tab==="prep"&&(<>
<div style={{fontFamily:C.serif,fontSize:16,fontWeight:700,marginBottom:10}}>🍳 Week {week} Meal Prep</div>
<div style={{fontSize:12,color:C.muted,marginBottom:12}}>Prep tasks for the week — cook, batch, and freeze</div>
{(BP[week]||[]).map((b,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
<span style={{fontSize:11,color:C.accent,fontWeight:700,flexShrink:0}}>•</span>
<span style={{fontSize:13,color:C.warm,lineHeight:1.5}}>{b}</span></div>))}
<div style={{fontFamily:C.serif,fontSize:16,fontWeight:700,marginTop:24,marginBottom:10}}>🥜 Nut Blend Guide</div>
{NB.filter(b=>b.wk.includes(week)).map((b,i)=>(<div key={i} style={{...st.eduC(C.accentLt,C.accent)}}><div style={st.eduT}>{b.w}</div><div style={st.eduX}>{b.t}</div></div>))}
</>)}

{/* ═══ GROCERY TAB ═══ */}
{tab==="grocery"&&(<>
<div style={{fontFamily:C.serif,fontSize:16,fontWeight:700,marginBottom:10}}>🛒 Week {week} Grocery List</div>
{gl.map(g=>(<div key={g.cat}><div style={{fontWeight:700,fontSize:14,margin:"14px 0 6px"}}>{g.cat}</div>
{g.items.map(it=><div key={it} style={{fontSize:13,color:C.warm,padding:"3px 0 3px 12px"}}>• {it}</div>)}</div>))}
</>)}

{/* ═══ TIPS TAB ═══ */}
{tab==="tips"&&(<>
<div style={{fontFamily:C.serif,fontSize:16,fontWeight:700,marginBottom:12}}>Quick Reference</div>
{Object.entries(EDU).map(([k,e])=>(<div key={k} style={st.eduC(e.bg,e.c)}><div style={st.eduT}>{e.i} {e.t}</div><div style={st.eduX}>{e.x}</div></div>))}
<div style={{...st.eduC("#F5F2ED","#8C857B"),marginTop:16}}><div style={st.eduT}>📋 Allergen Schedule</div><div style={st.eduX}><strong>Day 1:</strong> Peanut · <strong>3:</strong> Egg · <strong>5:</strong> Dairy · <strong>7:</strong> Wheat · <strong>8:</strong> Sesame · <strong>10:</strong> Almond · <strong>12:</strong> Walnut · <strong>14:</strong> Hazelnut · <strong>15:</strong> Fish · <strong>16:</strong> Pistachio · <strong>18:</strong> Pecan · <strong>19:</strong> Shellfish · <strong>21:</strong> Soy</div></div>
<div style={st.eduC("#F5F2ED","#8C857B")}><div style={st.eduT}>🚨 Red Flags</div><div style={st.eduX}>Hives/welts · Face/lip/tongue swelling · Vomiting within 2 hrs · Difficulty breathing · Sudden lethargy · Severe eczema worsening</div></div>
<div style={st.eduC("#F5F2ED","#8C857B")}><div style={st.eduT}>📏 Serving Sizes (Week 3+)</div><div style={st.eduX}>PB: 2 tsp · Nut butter: 2 tsp · Egg: ⅓–½ · Yogurt: 2–4 oz · Cereal: 2–3 tbsp · Tahini: 1–2 tsp · Fish: 1–2 oz · Shrimp: 1 oz · Tofu: 2 oz</div></div>
<div style={{marginTop:24,padding:"14px",background:C.redLt,borderRadius:C.rs,border:`1px solid ${C.red}33`}}>
<div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:6}}>⚠️ Reset All Data</div>
<div style={{fontSize:12,color:C.warm,marginBottom:8}}>This will clear all logged reactions, food counts, and week progress. This cannot be undone.</div>
<button style={{padding:"6px 14px",borderRadius:C.rs,border:`1px solid ${C.red}`,background:"#fff",color:C.red,fontSize:12,fontWeight:600,cursor:"pointer"}} onClick={()=>{if(confirm("Are you sure? This will erase all of Tessa's logged reactions and progress.")){setChecks({});setFoodLog({});setActiveWeek(1);setWeek(1);set(ref(db,"tessa-app/state"),{checks:{},foodLog:{},activeWeek:1,week:1}).catch(()=>{});setSaveMsg("🗑️ Cleared");}}}>Reset Everything</button></div>
</>)}
</div></div>);
}
