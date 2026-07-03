export interface SportMetricField {
  id: string;
  name: string;
  type: "text" | "number" | "select";
  unit?: string;
  options?: string[];
  required?: boolean;
}

export interface SportMetricTemplate {
  id: string;
  sport: string;
  fields: SportMetricField[];
}

export const SPORT_METRIC_TEMPLATES: SportMetricTemplate[] = [
  {
    id: "smt-cricket",
    sport: "Cricket",
    fields: [
      { id: "smf-c1", name: "Batting Average", type: "number", required: false },
      { id: "smf-c2", name: "Batting Strike Rate", type: "number", required: false },
      { id: "smf-c3", name: "Wickets Taken", type: "number", required: false },
      { id: "smf-c4", name: "Bowling Economy Rate", type: "number", required: false },
      { id: "smf-c5", name: "Matches Played", type: "number", required: false }
    ]
  },
  {
    id: "smt-kabaddi",
    sport: "Kabaddi",
    fields: [
      { id: "smf-k1", name: "Raid Points", type: "number", required: false },
      { id: "smf-k2", name: "Tackle Points", type: "number", required: false },
      { id: "smf-k3", name: "Super Raids", type: "number", required: false },
      { id: "smf-k4", name: "Super Tackles", type: "number", required: false },
      { id: "smf-k5", name: "Successful Raids %", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-hockey",
    sport: "Field Hockey",
    fields: [
      { id: "smf-h1", name: "Goals Scored", type: "number", required: false },
      { id: "smf-h2", name: "Assists Recorded", type: "number", required: false },
      { id: "smf-h3", name: "Penalty Corner Conversion Rate", type: "number", unit: "%", required: false },
      { id: "smf-h4", name: "Interceptions Per Game", type: "number", required: false }
    ]
  },
  {
    id: "smt-badminton",
    sport: "Badminton",
    fields: [
      { id: "smf-bad1", name: "Smash Speed", type: "number", unit: "km/h", required: false },
      { id: "smf-bad2", name: "Win-Loss Record", type: "text", required: false },
      { id: "smf-bad3", name: "National / State Rank", type: "number", required: false },
      { id: "smf-bad4", name: "Tournament Titles", type: "number", required: false }
    ]
  },
  {
    id: "smt-wrestling",
    sport: "Wrestling",
    fields: [
      { id: "smf-w1", name: "Weight Category", type: "text", unit: "kg", required: false },
      { id: "smf-w2", name: "Takedowns Per Match", type: "number", required: false },
      { id: "smf-w3", name: "Pins / Falls Count", type: "number", required: false },
      { id: "smf-w4", name: "Defensive Escapes Rate", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-football",
    sport: "Football (Soccer)",
    fields: [
      { id: "smf-f1", name: "Goals Scored", type: "number", required: false },
      { id: "smf-f2", name: "Assists Recorded", type: "number", required: false },
      { id: "smf-f3", name: "Passing Accuracy", type: "number", unit: "%", required: false },
      { id: "smf-f4", name: "Sprint Speed (100m)", type: "text", unit: "seconds", required: false }
    ]
  },
  {
    id: "smt-athletics",
    sport: "Athletics (Track & Field)",
    fields: [
      { id: "smf-a1", name: "Primary Event", type: "text", required: false },
      { id: "smf-a2", name: "Personal Best Time/Distance", type: "text", required: false },
      { id: "smf-a3", name: "Season Best", type: "text", required: false },
      { id: "smf-a4", name: "National Ranking", type: "number", required: false }
    ]
  },
  {
    id: "smt-shooting",
    sport: "Shooting",
    fields: [
      { id: "smf-s1", name: "Event Category", type: "text", required: false },
      { id: "smf-s2", name: "Average Score", type: "number", required: false },
      { id: "smf-s3", name: "Inner Tens Count", type: "number", required: false },
      { id: "smf-s4", name: "Finals Conversion Rate", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-boxing",
    sport: "Boxing",
    fields: [
      { id: "smf-box1", name: "Weight Division", type: "text", required: false },
      { id: "smf-box2", name: "Win-Loss-Draw Record", type: "text", required: false },
      { id: "smf-box3", name: "Punch Accuracy", type: "number", unit: "%", required: false },
      { id: "smf-box4", name: "KO/TKO Wins Count", type: "number", required: false }
    ]
  },
  {
    id: "smt-archery",
    sport: "Archery",
    fields: [
      { id: "smf-ar1", name: "Event Type", type: "text", required: false },
      { id: "smf-ar2", name: "Average Arrow Score", type: "number", required: false },
      { id: "smf-ar3", name: "10s & Xs Count", type: "number", required: false },
      { id: "smf-ar4", name: "Match Play Win Rate", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-weightlifting",
    sport: "Weightlifting",
    fields: [
      { id: "smf-wl1", name: "Body Weight Category", type: "text", unit: "kg", required: false },
      { id: "smf-wl2", name: "Snatch Personal Best", type: "number", unit: "kg", required: false },
      { id: "smf-wl3", name: "Clean & Jerk Personal Best", type: "number", unit: "kg", required: false },
      { id: "smf-wl4", name: "Total Lifted", type: "number", unit: "kg", required: false }
    ]
  },
  {
    id: "smt-tabletennis",
    sport: "Table Tennis",
    fields: [
      { id: "smf-tt1", name: "State / National Rank", type: "number", required: false },
      { id: "smf-tt2", name: "Spin Serve Success", type: "number", unit: "%", required: false },
      { id: "smf-tt3", name: "Backhand Winner Count", type: "number", required: false },
      { id: "smf-tt4", name: "Rally Win Rate", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-tennis",
    sport: "Tennis",
    fields: [
      { id: "smf-ten1", name: "First Serve Percentage", type: "number", unit: "%", required: false },
      { id: "smf-ten2", name: "Aces Per Match", type: "number", required: false },
      { id: "smf-ten3", name: "Break Points Saved Rate", type: "number", unit: "%", required: false },
      { id: "smf-ten4", name: "Unforced Errors Per Set", type: "number", required: false }
    ]
  },
  {
    id: "smt-squash",
    sport: "Squash",
    fields: [
      { id: "smf-sq1", name: "Length Accuracy Rate", type: "number", unit: "%", required: false },
      { id: "smf-sq2", name: "Nick Shots Count", type: "number", required: false },
      { id: "smf-sq3", name: "Game Win Percentage", type: "number", unit: "%", required: false },
      { id: "smf-sq4", name: "Matches Won", type: "number", required: false }
    ]
  },
  {
    id: "smt-chess",
    sport: "Chess",
    fields: [
      { id: "smf-ch1", name: "FIDE Rating", type: "number", required: false },
      { id: "smf-ch2", name: "Title Preference", type: "text", required: false },
      { id: "smf-ch3", name: "Primary Opening", type: "text", required: false },
      { id: "smf-ch4", name: "Puzzle Rating", type: "number", required: false }
    ]
  },
  {
    id: "smt-khokho",
    sport: "Kho Kho",
    fields: [
      { id: "smf-kk1", name: "Chaser Points", type: "number", required: false },
      { id: "smf-kk2", name: "Defender Running Time", type: "text", unit: "mins", required: false },
      { id: "smf-kk3", name: "Active Taps Count", type: "number", required: false },
      { id: "smf-kk4", name: "Pole Dive Success Rate", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-billiards",
    sport: "Billiards / Snooker",
    fields: [
      { id: "smf-bil1", name: "Highest Break", type: "number", required: false },
      { id: "smf-bil2", name: "Potting Success Rate", type: "number", unit: "%", required: false },
      { id: "smf-bil3", name: "Safety Play Success Rate", type: "number", unit: "%", required: false },
      { id: "smf-bil4", name: "Matches Won", type: "number", required: false }
    ]
  },
  {
    id: "smt-basketball",
    sport: "Basketball",
    fields: [
      { id: "smf-b1", name: "Points Per Game (PPG)", type: "number", required: false },
      { id: "smf-b2", name: "3-Point Shot Percentage", type: "number", unit: "%", required: false },
      { id: "smf-b3", name: "Rebounds Per Game", type: "number", required: false },
      { id: "smf-b4", name: "Assists Per Game", type: "number", required: false }
    ]
  },
  {
    id: "smt-volleyball",
    sport: "Volleyball",
    fields: [
      { id: "smf-v1", name: "Vertical Jump", type: "number", unit: "cm", required: false },
      { id: "smf-v2", name: "Spike Touch", type: "number", unit: "cm", required: false },
      { id: "smf-v3", name: "Block Touch", type: "number", unit: "cm", required: false },
      { id: "smf-v4", name: "Serve Aces", type: "number", required: false }
    ]
  },
  {
    id: "smt-golf",
    sport: "Golf",
    fields: [
      { id: "smf-g1", name: "Handicap Index", type: "number", required: false },
      { id: "smf-g2", name: "Driving Distance", type: "number", unit: "yards", required: false },
      { id: "smf-g3", name: "Greens in Regulation Rate", type: "number", unit: "%", required: false },
      { id: "smf-g4", name: "Average Putts Per Round", type: "number", required: false }
    ]
  },
  {
    id: "smt-swimming",
    sport: "Swimming",
    fields: [
      { id: "smf-sw1", name: "Preferred Style", type: "text", required: false },
      { id: "smf-sw2", name: "50m Personal Best", type: "text", unit: "seconds", required: false },
      { id: "smf-sw3", name: "100m Personal Best", type: "text", unit: "seconds", required: false },
      { id: "smf-sw4", name: "Medal Tally", type: "number", required: false }
    ]
  },
  {
    id: "smt-gymnastics",
    sport: "Gymnastics",
    fields: [
      { id: "smf-gym1", name: "Core Discipline", type: "text", required: false },
      { id: "smf-gym2", name: "Difficulty Score (D)", type: "number", required: false },
      { id: "smf-gym3", name: "Execution Score (E)", type: "number", required: false },
      { id: "smf-gym4", name: "Combined Total Score", type: "number", required: false }
    ]
  },
  {
    id: "smt-judo",
    sport: "Judo",
    fields: [
      { id: "smf-jd1", name: "Weight Class", type: "text", unit: "kg", required: false },
      { id: "smf-jd2", name: "Ippon Wins", type: "number", required: false },
      { id: "smf-jd3", name: "Waza-ari Scores", type: "number", required: false },
      { id: "smf-jd4", name: "Penalty (Shido) Average", type: "number", required: false }
    ]
  },
  {
    id: "smt-karate",
    sport: "Karate",
    fields: [
      { id: "smf-kar1", name: "Category (Kata/Kumite)", type: "text", required: false },
      { id: "smf-kar2", name: "Weight Division", type: "text", required: false },
      { id: "smf-kar3", name: "Ippon Strikes Count", type: "number", required: false },
      { id: "smf-kar4", name: "Senshu Success Rate", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-taekwondo",
    sport: "Taekwondo",
    fields: [
      { id: "smf-tkd1", name: "Weight Division", type: "text", required: false },
      { id: "smf-tkd2", name: "Head Kick Accuracy Rate", type: "number", unit: "%", required: false },
      { id: "smf-tkd3", name: "Gam-jeom Average", type: "number", required: false },
      { id: "smf-tkd4", name: "Successful Spin Kicks", type: "number", required: false }
    ]
  },
  {
    id: "smt-rowing",
    sport: "Rowing",
    fields: [
      { id: "smf-row1", name: "2000m Erg Time", type: "text", unit: "mins", required: false },
      { id: "smf-row2", name: "Stroke Rate", type: "number", unit: "spm", required: false },
      { id: "smf-row3", name: "Boat Category", type: "text", required: false },
      { id: "smf-row4", name: "Clean Pull Force", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-cycling",
    sport: "Cycling",
    fields: [
      { id: "smf-cy1", name: "FTP Rating", type: "number", unit: "Watts", required: false },
      { id: "smf-cy2", name: "Max Sprint Power", type: "number", unit: "Watts", required: false },
      { id: "smf-cy3", name: "20km Time Trial PB", type: "text", unit: "mins", required: false },
      { id: "smf-cy4", name: "Favorite Event", type: "text", required: false }
    ]
  },
  {
    id: "smt-wushu",
    sport: "Wushu",
    fields: [
      { id: "smf-wsh1", name: "Discipline (Sanda/Taolu)", type: "text", required: false },
      { id: "smf-wsh2", name: "Kick Takedowns", type: "number", required: false },
      { id: "smf-wsh3", name: "Form Artistry Rating", type: "number", required: false },
      { id: "smf-wsh4", name: "Punch Accuracy", type: "number", unit: "%", required: false }
    ]
  },
  {
    id: "smt-mallakhamb",
    sport: "Mallakhamb",
    fields: [
      { id: "smf-mal1", name: "Category (Pole/Rope/Hanging)", type: "text", required: false },
      { id: "smf-mal2", name: "Hold Stability Duration", type: "number", unit: "seconds", required: false },
      { id: "smf-mal3", name: "Flexibility Score", type: "number", required: false },
      { id: "smf-mal4", name: "Dismount Cleanliness Rating", type: "number", required: false }
    ]
  },
  {
    id: "smt-powerlifting",
    sport: "Powerlifting",
    fields: [
      { id: "smf-pl1", name: "Squat Personal Best", type: "number", unit: "kg", required: false },
      { id: "smf-pl2", name: "Bench Press Personal Best", type: "number", unit: "kg", required: false },
      { id: "smf-pl3", name: "Deadlift Personal Best", type: "number", unit: "kg", required: false },
      { id: "smf-pl4", name: "Wilks / DOTS Score", type: "number", required: false }
    ]
  },
  {
    id: "smt-handball",
    sport: "Handball",
    fields: [
      { id: "smf-hb1", name: "Goals Per Match", type: "number", required: false },
      { id: "smf-hb2", name: "Defensive Blocks", type: "number", required: false },
      { id: "smf-hb3", name: "Goalkeeper Save Rate", type: "number", unit: "%", required: false },
      { id: "smf-hb4", name: "Fastbreak Goals", type: "number", required: false }
    ]
  },
  {
    id: "smt-yoga",
    sport: "Yoga Sports",
    fields: [
      { id: "smf-yg1", name: "Posture Hold Time", type: "number", unit: "seconds", required: false },
      { id: "smf-yg2", name: "Flexibility Rating (1-10)", type: "number", required: false },
      { id: "smf-yg3", name: "Artistic Flow Score", type: "number", required: false }
    ]
  },
  {
    id: "smt-bodybuilding",
    sport: "Bodybuilding",
    fields: [
      { id: "smf-bb1", name: "Weight Division", type: "text", required: false },
      { id: "smf-bb2", name: "Competition Weight", type: "number", unit: "kg", required: false },
      { id: "smf-bb3", name: "Off-Season Weight", type: "number", unit: "kg", required: false },
      { id: "smf-bb4", name: "Titles Won", type: "number", required: false }
    ]
  },
  {
    id: "smt-motorsports",
    sport: "Motorsports",
    fields: [
      { id: "smf-ms1", name: "Fastest Lap Time", type: "text", required: false },
      { id: "smf-ms2", name: "Podium Finishes", type: "number", required: false },
      { id: "smf-ms3", name: "Pole Positions", type: "number", required: false },
      { id: "smf-ms4", name: "Championship Points", type: "number", required: false }
    ]
  }
];

export const INDIAN_SPORTS_KPIS: Record<string, string[]> = {
  "Cricket": ["Runs", "Batting Average", "Wickets", "Economy", "Strike Rate", "Matches Played"],
  "Kabaddi": ["Raid Points", "Tackle Points", "Super Raids", "Super Tackles", "Successful Raids %"],
  "Field Hockey": ["Goals Scored", "Assists Recorded", "Penalty Corner Conversion %", "Interceptions Per Game"],
  "Badminton": ["Smash Speed", "Win-Loss Record", "National Rank", "Tournament Titles"],
  "Wrestling": ["Weight Category", "Takedowns Per Match", "Pins/Falls Count", "Defensive Escapes Rate"],
  "Football (Soccer)": ["Goals Scored", "Assists Recorded", "Passing Accuracy", "Sprint Speed"],
  "Athletics (Track & Field)": ["Primary Event", "Personal Best", "Season Best", "National Ranking"],
  "Shooting": ["Event Category", "Average Score", "Inner Tens Count", "Finals Conversion %"],
  "Boxing": ["Weight Division", "Win-Loss-Draw Record", "Punch Accuracy %", "KO/TKO Wins"],
  "Archery": ["Event Type", "Average Arrow Score", "10s & Xs Count", "Match Play Win Rate"],
  "Weightlifting": ["Body Weight Category", "Snatch Personal Best", "Clean & Jerk Personal Best", "Total Lifted"],
  "Table Tennis": ["State / National Rank", "Spin Serve Success %", "Backhand Winner Count", "Rally Win Rate"],
  "Tennis": ["First Serve Percentage", "Aces Per Match", "Break Points Saved Rate", "Unforced Errors Per Set"],
  "Squash": ["Length Accuracy Rate", "Nick Shots Count", "Game Win Percentage", "Matches Won"],
  "Chess": ["FIDE Rating", "Title Preference", "Primary Opening", "Puzzle Rating"],
  "Kho Kho": ["Chaser Points", "Defender Running Time", "Active Taps Count", "Pole Dive Success Rate"],
  "Billiards / Snooker": ["Highest Break", "Potting Success Rate", "Safety Play Success Rate", "Matches Won"],
  "Basketball": ["Points Per Game (PPG)", "3-Point Shot Percentage", "Rebounds Per Game", "Assists Per Game"],
  "Volleyball": ["Vertical Jump", "Spike Touch", "Block Touch", "Serve Aces"],
  "Golf": ["Handicap Index", "Driving Distance", "Greens in Regulation Rate", "Average Putts Per Round"],
  "Swimming": ["Preferred Style", "50m Personal Best", "100m Personal Best", "Medal Tally"],
  "Gymnastics": ["Core Discipline", "Difficulty Score (D)", "Execution Score (E)", "Combined Total Score"],
  "Judo": ["Weight Class", "Ippon Wins", "Waza-ari Scores", "Penalty Average"],
  "Karate": ["Category (Kata/Kumite)", "Weight Division", "Ippon Strikes Count", "Senshu Success Rate"],
  "Taekwondo": ["Weight Division", "Head Kick Accuracy Rate", "Gam-jeom Average", "Successful Spin Kicks"],
  "Rowing": ["2000m Erg Time", "Stroke Rate", "Boat Category", "Clean Pull Force"],
  "Cycling": ["FTP Rating", "Max Sprint Power", "20km Time Trial PB", "Favorite Event"],
  "Wushu": ["Discipline (Sanda/Taolu)", "Kick Takedowns", "Form Artistry Rating", "Punch Accuracy"],
  "Mallakhamb": ["Category (Pole/Rope/Hanging)", "Hold Stability Duration", "Flexibility Score", "Dismount Cleanliness"],
  "Powerlifting": ["Squat Personal Best", "Bench Press Personal Best", "Deadlift Personal Best", "Wilks / DOTS Score"],
  "Handball": ["Goals Per Match", "Defensive Blocks", "Goalkeeper Save Rate", "Fastbreak Goals"],
  "Yoga Sports": ["Posture Hold Time", "Flexibility Rating (1-10)", "Artistic Flow Score"],
  "Bodybuilding": ["Weight Division", "Competition Weight", "Off-Season Weight", "Titles Won"],
  "Motorsports": ["Fastest Lap Time", "Podium Finishes", "Pole Positions", "Championship Points"]
};

export class SportsMetricsService {
  static getTemplates(): SportMetricTemplate[] {
    return SPORT_METRIC_TEMPLATES;
  }

  static getTemplateForSport(sportName: string): SportMetricTemplate | undefined {
    const normalized = sportName.toLowerCase().trim();
    // Try exact or contains matching
    return SPORT_METRIC_TEMPLATES.find(
      t => t.sport.toLowerCase().trim() === normalized || 
           normalized.includes(t.sport.toLowerCase().trim()) ||
           t.sport.toLowerCase().trim().includes(normalized)
    );
  }

  static getKPIFieldsForSport(sportName: string): SportMetricField[] {
    const template = this.getTemplateForSport(sportName);
    return template ? template.fields : [];
  }

  static getPerformanceAttributesForSport(sportName?: string) {
    const sport = (sportName || "").toLowerCase().trim();

    if (sport.includes("cricket")) {
      return [
        { id: "attr_batting", label: "Batting Skill", defaultVal: "85" },
        { id: "attr_bowling", label: "Bowling Skill", defaultVal: "80" },
        { id: "attr_fielding", label: "Fielding & Reflexes", defaultVal: "87" },
        { id: "attr_tactical", label: "Match Awareness / IQ", defaultVal: "82" },
        { id: "attr_stamina", label: "Stamina / Fitness", defaultVal: "88" },
        { id: "attr_running", label: "Running between Wickets", defaultVal: "78" },
        { id: "attr_leadership", label: "Leadership / Communication", defaultVal: "84" }
      ];
    }
    
    if (sport.includes("basketball")) {
      return [
        { id: "attr_shooting", label: "Shooting & Finishing", defaultVal: "85" },
        { id: "attr_passing", label: "Playmaking / Passing", defaultVal: "80" },
        { id: "attr_dribbling", label: "Ball Handling / Dribbling", defaultVal: "87" },
        { id: "attr_defense", label: "Defensive IQ / Rebounding", defaultVal: "82" },
        { id: "attr_stamina", label: "Stamina & Agility", defaultVal: "88" },
        { id: "attr_tactical", label: "Tactical Awareness", defaultVal: "78" },
        { id: "attr_leadership", label: "Leadership / Communication", defaultVal: "84" }
      ];
    }

    if (sport.includes("kabaddi")) {
      return [
        { id: "attr_raiding", label: "Raiding Technique", defaultVal: "85" },
        { id: "attr_defending", label: "Tackle & Defense", defaultVal: "80" },
        { id: "attr_agility", label: "Agility & Footwork", defaultVal: "87" },
        { id: "attr_strength", label: "Strength & Power", defaultVal: "82" },
        { id: "attr_stamina", label: "Stamina & Endurance", defaultVal: "88" },
        { id: "attr_tactical", label: "Tactical Mindset", defaultVal: "78" },
        { id: "attr_leadership", label: "Team Communication / Lead", defaultVal: "84" }
      ];
    }

    if (sport.includes("badminton") || sport.includes("tennis") || sport.includes("table tennis") || sport.includes("squash") || sport.includes("billiards") || sport.includes("snooker")) {
      return [
        { id: "attr_shot_power", label: "Shot Power & Smash", defaultVal: "85" },
        { id: "attr_control", label: "Accuracy & Placement", defaultVal: "80" },
        { id: "attr_agility", label: "Court Coverage / Agility", defaultVal: "87" },
        { id: "attr_reflexes", label: "Reflexes & Coordination", defaultVal: "82" },
        { id: "attr_stamina", label: "Stamina / Fitness", defaultVal: "88" },
        { id: "attr_tactical", label: "Match Tactics & IQ", defaultVal: "78" },
        { id: "attr_leadership", label: "Mental Focus / Resilience", defaultVal: "84" }
      ];
    }

    if (sport.includes("wrestling") || sport.includes("boxing") || sport.includes("martial") || sport.includes("judo") || sport.includes("karate") || sport.includes("taekwondo")) {
      return [
        { id: "attr_offensive", label: "Striking / Grappling", defaultVal: "85" },
        { id: "attr_defensive", label: "Guard & Defense", defaultVal: "80" },
        { id: "attr_speed", label: "Speed & Reflexes", defaultVal: "87" },
        { id: "attr_power", label: "Explosive Power", defaultVal: "82" },
        { id: "attr_stamina", label: "Stamina & Grit", defaultVal: "88" },
        { id: "attr_tactical", label: "Fight Strategy", defaultVal: "78" },
        { id: "attr_leadership", label: "Composure & Focus", defaultVal: "84" }
      ];
    }

    if (sport.includes("athletics") || sport.includes("track") || sport.includes("cycling") || sport.includes("swimming") || sport.includes("rowing")) {
      return [
        { id: "attr_speed", label: "Speed & Acceleration", defaultVal: "85" },
        { id: "attr_power", label: "Explosive Power", defaultVal: "80" },
        { id: "attr_endurance", label: "Endurance & Pace", defaultVal: "87" },
        { id: "attr_technique", label: "Technique / Form", defaultVal: "82" },
        { id: "attr_stamina", label: "Stamina / Fitness", defaultVal: "88" },
        { id: "attr_tactical", label: "Race / Event Strategy", defaultVal: "78" },
        { id: "attr_leadership", label: "Mental Drive & Focus", defaultVal: "84" }
      ];
    }

    if (sport.includes("hockey")) {
      return [
        { id: "attr_stick_work", label: "Stickwork & Control", defaultVal: "85" },
        { id: "attr_passing", label: "Passing Style & Acc", defaultVal: "80" },
        { id: "attr_dribbling", label: "Dribbling / Offense", defaultVal: "87" },
        { id: "attr_tactical", label: "Tactical Awareness", defaultVal: "82" },
        { id: "attr_stamina", label: "Stamina / Fitness", defaultVal: "88" },
        { id: "attr_shooting", label: "Shooting / Scoring", defaultVal: "78" },
        { id: "attr_leadership", label: "Leadership / Communication", defaultVal: "84" }
      ];
    }

    if (sport.includes("volleyball")) {
      return [
        { id: "attr_spiking", label: "Spiking / Attacking", defaultVal: "85" },
        { id: "attr_setting", label: "Setting / Passing", defaultVal: "80" },
        { id: "attr_blocking", label: "Blocking / Net Defense", defaultVal: "87" },
        { id: "attr_serving", label: "Serving Accuracy", defaultVal: "82" },
        { id: "attr_stamina", label: "Vertical Jump / Stamina", defaultVal: "88" },
        { id: "attr_tactical", label: "Tactical Placement", defaultVal: "78" },
        { id: "attr_leadership", label: "Court Communication", defaultVal: "84" }
      ];
    }

    if (sport.includes("gymnastic") || sport.includes("gymnastics")) {
      return [
        { id: "attr_flexibility", label: "Flexibility & Extension", defaultVal: "92" },
        { id: "attr_strength", label: "Core Strength & Power", defaultVal: "88" },
        { id: "attr_balance", label: "Balance & Precision", defaultVal: "90" },
        { id: "attr_execution", label: "Execution & Form", defaultVal: "85" },
        { id: "attr_landing", label: "Dismount & Landing Control", defaultVal: "87" },
        { id: "attr_artistry", label: "Artistry & Rhythm", defaultVal: "82" },
        { id: "attr_difficulty", label: "Difficulty / Start Value", defaultVal: "80" }
      ];
    }

    // Default is Football (Soccer)
    return [
      { id: "technical_skills", label: "Technical Skills", defaultVal: "85" },
      { id: "tactical_awareness", label: "Tactical Awareness", defaultVal: "80" },
      { id: "passing", label: "Passing Style / Acc", defaultVal: "87" },
      { id: "dribbling", label: "Dribbling / Control", defaultVal: "82" },
      { id: "stamina", label: "Stamina / Fitness", defaultVal: "88" },
      { id: "shooting", label: "Shooting / Scoring", defaultVal: "78" },
      { id: "leadership", label: "Leadership / Communication", defaultVal: "84" }
    ];
  }
}
