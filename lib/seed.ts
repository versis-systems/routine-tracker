import { createClient } from '@/lib/supabase/client'

export async function seedUserData(userId: string) {
  const supabase = createClient()

  // Create Morning Routine
  const { data: morningRoutine, error: morningError } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name: 'Ochtend Routine',
      description: 'Dagelijkse ochtend skincare routine',
      time_of_day: 'morning',
      is_active: true,
      sort_order: 0,
      notes: 'Vitamine C altijd op droge huid aanbrengen.\nSPF is de belangrijkste anti-aging stap — ook binnen en in de winter.\nVolgorde is belangrijk: reinigen → vitamine C → moisturizer → SPF.',
    })
    .select()
    .single()

  if (morningError || !morningRoutine) {
    console.error('Error creating morning routine:', morningError)
    return
  }

  // Morning steps
  const morningSteps = [
    {
      routine_id: morningRoutine.id,
      name: 'Effaclar Mousse/Gel (La Roche-Posay)',
      note: 'reinigen',
      instructions: 'Maak je gezicht nat met lauw water. Breng de mousse/gel aan en masseer 30–60 seconden in cirkelbewegingen. Spoel goed af met lauw water en dep droog met een schone handdoek.',
      product_name: 'Effaclar Purifying Foaming Gel',
      product_brand: 'La Roche-Posay',
      repeat_rule: 'daily',
      sort_order: 0,
    },
    {
      routine_id: morningRoutine.id,
      name: 'Vitamine C Serum (TruSkin)',
      note: 'wacht 1 min na reinigen, op droge huid',
      instructions: 'Wacht tot de huid volledig droog is (1 minuut na reinigen). Breng 3–4 druppels aan op het gezicht en dep voorzichtig in. Laat 1 minuut intrekken voor de volgende stap.',
      product_name: 'TruSkin Vitamin C Serum',
      product_brand: 'TruSkin',
      repeat_rule: 'daily',
      sort_order: 1,
    },
    {
      routine_id: morningRoutine.id,
      name: 'CeraVe Moisturizing Cream',
      note: 'hydratatie',
      instructions: 'Breng een royale hoeveelheid aan op het gezicht en nek. Masseer zacht in opwaartse bewegingen tot volledig opgenomen.',
      product_name: 'CeraVe Moisturizing Cream',
      product_brand: 'CeraVe',
      repeat_rule: 'daily',
      sort_order: 2,
    },
    {
      routine_id: morningRoutine.id,
      name: 'Anthelios SPF50+ Oil Control (La Roche-Posay)',
      note: 'ook binnen en in de winter',
      instructions: 'Breng ruim aan — minimaal een halve theelepel voor gezicht en nek. Aanbrengen als laatste stap. Ook nodig bij bewolkt weer, binnenshuis (ramen) en in de winter. Elke 2 uur opnieuw aanbrengen bij buiten zijn.',
      product_name: 'Anthelios UV-Mune 400 Oil Control Fluid SPF50+',
      product_brand: 'La Roche-Posay',
      repeat_rule: 'daily',
      sort_order: 3,
    },
    {
      routine_id: morningRoutine.id,
      name: 'Labello Sun Protect SPF30',
      note: 'lippen',
      instructions: 'Breng een laagje aan op de lippen. Hergebruik gedurende de dag.',
      product_name: 'Labello Sun Protect SPF30',
      product_brand: 'Labello',
      repeat_rule: 'daily',
      sort_order: 4,
    },
  ]

  await supabase.from('steps').insert(morningSteps)

  // Create Evening Routine
  const { data: eveningRoutine, error: eveningError } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name: 'Avond Routine',
      description: 'Dagelijkse avond skincare routine',
      time_of_day: 'evening',
      is_active: true,
      sort_order: 1,
      notes: 'Retinol nooit combineren met vitamine C.\nEerste 2 weken geen retinol — huid eerst laten wennen aan de basis.\nNa 1 maand opbouwen van 1x naar 2x per week.\nCastor oil werkt pas na 4–8 weken.\nBij irritatie van retinol: gebruik elke andere avond.',
    })
    .select()
    .single()

  if (eveningError || !eveningRoutine) {
    console.error('Error creating evening routine:', eveningError)
    return
  }

  const retinolPhaseConfig = {
    phases: [
      {
        week_start: 1,
        week_end: 2,
        active: false,
        days: [],
        label: 'Week 1–2: geen retinol — huid went aan de basis',
      },
      {
        week_start: 3,
        week_end: 4,
        active: true,
        days: [1], // Monday only
        label: 'Week 3–4: 1× per week (maandag)',
      },
      {
        week_start: 5,
        week_end: null,
        active: true,
        days: [1, 3], // Monday + Wednesday
        label: 'Maand 2+: 2× per week (maandag & woensdag)',
      },
    ],
  }

  const today = new Date().toISOString().split('T')[0]

  const eveningSteps = [
    {
      routine_id: eveningRoutine.id,
      name: 'Effaclar Mousse/Gel (La Roche-Posay)',
      note: 'reinigen',
      instructions: 'Maak je gezicht nat met lauw water. Breng de mousse/gel aan en masseer 30–60 seconden in cirkelbewegingen. Spoel goed af met lauw water en dep droog met een schone handdoek.',
      product_name: 'Effaclar Purifying Foaming Gel',
      product_brand: 'La Roche-Posay',
      repeat_rule: 'daily',
      sort_order: 0,
    },
    {
      routine_id: eveningRoutine.id,
      name: 'Retinol 0.5% in Squalane (The Ordinary)',
      note: 'opbouwschema actief',
      instructions: 'Gebruik ALLEEN op avonden volgens het schema (zie fase-label hieronder). Breng 2–3 druppels aan op droge huid — wacht minstens 20 minuten na reinigen. Vermijd oogomgeving en lippen. Nooit combineren met vitamine C. Bij irritatie: gebruik elke andere avond.',
      product_name: 'Retinol 0.5% in Squalane',
      product_brand: 'The Ordinary',
      repeat_rule: 'specific_days',
      repeat_days: [1, 3],
      sort_order: 1,
      phase_enabled: true,
      phase_start_date: today,
      phase_config: retinolPhaseConfig,
    },
    {
      routine_id: eveningRoutine.id,
      name: "Kiehl's Creamy Eye Treatment",
      note: 'rondom oogholte',
      instructions: 'Breng een kleine hoeveelheid (rijstkorrelgrootte) met ringvinger aan rondom de oogholte. Dep voorzichtig — nooit wrijven. Gebruik ook op het ooglid.',
      product_name: 'Creamy Eye Treatment with Avocado',
      product_brand: "Kiehl's",
      repeat_rule: 'daily',
      sort_order: 2,
    },
    {
      routine_id: eveningRoutine.id,
      name: 'CeraVe Moisturizing Cream',
      note: 'dik aanbrengen',
      instructions: "Avond: breng dik aan als afsluiting ('slugging light'). Meer dan overdag. Focus op droge plekken.",
      product_name: 'CeraVe Moisturizing Cream',
      product_brand: 'CeraVe',
      repeat_rule: 'daily',
      sort_order: 3,
    },
    {
      routine_id: eveningRoutine.id,
      name: 'Jamaican Black Castor Oil',
      note: 'wenkbrauwen',
      instructions: 'Breng 2–3 druppels aan op wenkbrauwen met een schone spoolie of vingertop. Masseer zacht. Resultaat zichtbaar na 4–8 weken consequent gebruik.',
      product_name: 'Jamaican Black Castor Oil',
      product_brand: 'Tropic Isle Living',
      repeat_rule: 'daily',
      sort_order: 4,
    },
  ]

  await supabase.from('steps').insert(eveningSteps)

  // Create Extra Daily Routine
  const { data: extraDailyRoutine } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name: 'Extra Dagelijks',
      description: 'Dagelijkse extra verzorging',
      time_of_day: 'free',
      is_active: true,
      sort_order: 2,
    })
    .select()
    .single()

  if (extraDailyRoutine) {
    await supabase.from('steps').insert([
      {
        routine_id: extraDailyRoutine.id,
        name: 'Jawline exerciser',
        note: '10–15 minuten',
        instructions: '10–15 minuten kauen terwijl je tv kijkt of werkt. Resultaat zichtbaar na 3–6 maanden. Begin met 10 minuten en bouw op.',
        product_name: 'Jawline Trainer',
        product_brand: null,
        repeat_rule: 'daily',
        sort_order: 0,
      },
    ])
  }

  // Create Extra Weekly Routine
  const { data: extraWeeklyRoutine } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name: 'Extra Wekelijks',
      description: 'Wekelijkse extra verzorging',
      time_of_day: 'free',
      is_active: true,
      sort_order: 3,
    })
    .select()
    .single()

  if (extraWeeklyRoutine) {
    await supabase.from('steps').insert([
      {
        routine_id: extraWeeklyRoutine.id,
        name: 'Lippen exfoliëren',
        note: 'met zachte tandenborstel',
        instructions: 'Bevochtig lippen. Gebruik een zachte tandenborstel en maak kleine cirkelbewegingen gedurende 30 seconden. Spoel af. Breng daarna Labello aan.',
        product_name: null,
        product_brand: null,
        repeat_rule: 'specific_days',
        repeat_days: [6],
        sort_order: 0,
      },
      {
        routine_id: extraWeeklyRoutine.id,
        name: 'Gezichtsmasker',
        note: 'optioneel',
        instructions: 'Kies een masker passend bij je huidtype. Breng aan na reinigen op droge huid. Volg de tijdsinstructies op de verpakking. Niet meer dan 1× per week.',
        product_name: null,
        product_brand: null,
        repeat_rule: 'specific_days',
        repeat_days: [6],
        sort_order: 1,
      },
    ])
  }

  // Create routine info for Morning and Evening routines
  const sharedExpectedResults = [
    { label: 'hydratatie', timeframe: '1-2 weken' },
    { label: 'glow', timeframe: '3-4 weken' },
    { label: 'wenkbrauwen groeien', timeframe: '4-8 weken' },
    { label: 'retinol effect zichtbaar', timeframe: '8-12 weken' },
    { label: 'kaaklijn', timeframe: '3-6 maanden' },
  ]

  const sharedRules = [
    'Retinol NOOIT combineren met vitamine C',
    'SPF ook binnen en in de winter verplicht',
    'Castor oil werkt pas na 4-8 weken consequent gebruik',
    'Opbouw retinol is verplicht, niet overslaan',
    'Vitamine C altijd op droge huid aanbrengen',
    'Zaterdag: lippen exfoliëren',
  ]

  const sharedProducts = [
    { name: 'Effaclar Mousse/Gel', brand: 'La Roche-Posay', when: 'morning+evening', owned: true },
    { name: 'Vitamine C Serum', brand: 'TruSkin', when: 'morning', owned: true },
    { name: 'CeraVe Moisturizing Cream', brand: 'CeraVe', when: 'morning+evening', owned: true },
    { name: 'Anthelios SPF50+ Oil Control', brand: 'La Roche-Posay', when: 'morning', owned: true },
    { name: 'Labello Sun Protect SPF30', brand: 'Labello', when: 'morning', owned: true },
    { name: 'Retinol 0.5% in Squalane', brand: 'The Ordinary', when: 'evening', owned: true },
    { name: "Creamy Eye Treatment", brand: "Kiehl's", when: 'evening', owned: true },
    { name: 'Jamaican Black Castor Oil', brand: 'Jamaican', when: 'evening', owned: true },
  ]

  await supabase.from('routine_info').insert([
    {
      routine_id: morningRoutine.id,
      expected_results: sharedExpectedResults,
      rules: sharedRules,
      products: sharedProducts,
      free_text: null,
    },
    {
      routine_id: eveningRoutine.id,
      expected_results: sharedExpectedResults,
      rules: sharedRules,
      products: sharedProducts,
      free_text: null,
    },
  ])

  return { success: true }
}
