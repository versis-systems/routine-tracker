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
      repeat_rule: 'daily',
      sort_order: 0,
    },
    {
      routine_id: morningRoutine.id,
      name: 'Vitamine C Serum (TruSkin)',
      note: 'wacht 1 min na reinigen, op droge huid',
      repeat_rule: 'daily',
      sort_order: 1,
    },
    {
      routine_id: morningRoutine.id,
      name: 'CeraVe Moisturizing Cream',
      note: 'hydratatie',
      repeat_rule: 'daily',
      sort_order: 2,
    },
    {
      routine_id: morningRoutine.id,
      name: 'Anthelios SPF50+ Oil Control (La Roche-Posay)',
      note: 'ook binnen en in de winter',
      repeat_rule: 'daily',
      sort_order: 3,
    },
    {
      routine_id: morningRoutine.id,
      name: 'Labello Sun Protect SPF30',
      note: 'lippen',
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
        label: 'Week 1-2: opbouwfase, retinol uitgeschakeld',
      },
      {
        week_start: 3,
        week_end: 4,
        active: true,
        days: [3],
        label: 'Week 3-4: 1× per week (woensdag)',
      },
      {
        week_start: 5,
        week_end: null,
        active: true,
        days: [1, 3],
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
      repeat_rule: 'daily',
      sort_order: 0,
    },
    {
      routine_id: eveningRoutine.id,
      name: 'Retinol 0.5% in Squalane (The Ordinary)',
      note: 'opbouwschema actief',
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
      repeat_rule: 'daily',
      sort_order: 2,
    },
    {
      routine_id: eveningRoutine.id,
      name: 'CeraVe Moisturizing Cream',
      note: 'dik aanbrengen',
      repeat_rule: 'daily',
      sort_order: 3,
    },
    {
      routine_id: eveningRoutine.id,
      name: 'Jamaican Black Castor Oil',
      note: 'wenkbrauwen',
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
        repeat_rule: 'specific_days',
        repeat_days: [6],
        sort_order: 0,
      },
      {
        routine_id: extraWeeklyRoutine.id,
        name: 'Gezichtsmasker',
        note: 'optioneel',
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
