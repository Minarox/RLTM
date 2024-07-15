import db from "../extensions/drizzle.ts";
import { arena } from "../schemas/arena.ts";

await db().insert(arena).values([
    {
        code: "stadium_p",
        name: "DFH Stadium"
    },
    {
        code: "eurostadium_p",
        name: "Mannfield"
    },
    {
        code: "cs_p",
        name: "Champions Field"
    },
    {
        code: "trainstation_p",
        name: "Urban Central"
    },
    {
        code: "park_p",
        name: "Beckwith Park"
    },
    {
        code: "utopiastadium_p",
        name: "Utopia Coliseum"
    },
    {
        code: "wasteland_s_p",
        name: "Wasteland"
    },
    {
        code: "neotokyo_standard_p",
        name: "Neo Tokyo"
    },
    {
        code: "underwater_p",
        name: "AquaDome"
    },
    {
        code: "farm_p",
        name: "Farmstead"
    },
    {
        code: "chn_stadium_p",
        name: "Forbidden Temple"
    },
    {
        code: "outlaw_p",
        name: "Deadeye Canyon"
    },
    {
        code: "music_p",
        name: "Neon Fields"
    },
    {
        code: "beach_p",
        name: "Salty Shores"
    },
    {
        code: "street_p",
        name: "Sovereign Heights"
    },
    {
        code: "arc_standard_p",
        name: "Starbase ARC"
    },
    {
        code: "cs_hw_p",
        name: "Rivals Arena"
    },
    {
        code: "ff_dusk_p",
        name: "Estadio Vida"
    },
    {
        code: "arc_p",
        name: "ARCtagon (Rumble)"
    },
    {
        code: "wasteland_p",
        name: "Badlands (Rumble)"
    },
    {
        code: "throwbackstadium_p",
        name: "Throwback Stadium (Rumble)"
    },
    {
        code: "neotokyo_p",
        name: "Tokyo Underpass (Rumble)"
    },
    {
        code: "shattershot_p",
        name: "Core 707 (Dropshot)"
    },
    {
        code: "hoopsstadium_p",
        name: "Dunk House (Hoops)"
    },
    {
        code: "hoopsstreet_p",
        name: "The Block (Hoops)"
    },
    {
        code: "labs_circlepillars_p",
        name: "Pillars"
    },
    {
        code: "labs_cosmic_v4_p",
        name: "Cosmic"
    },
    {
        code: "labs_doublegoal_v2_p",
        name: "Double Goal"
    },
    {
        code: "labs_underpass_p",
        name: "Underpass"
    },
    {
        code: "labs_utopia_p",
        name: "Utopia Retro"
    },
    {
        code: "labs_octagon_02_p",
        name: "Octagon"
    },
    {
        code: "labs_basin_p",
        name: "Basin"
    },
    {
        code: "labs_corridor_p",
        name: "Corridor"
    },
    {
        code: "labs_galleon_p",
        name: "Galleon"
    },
    {
        code: "labs_galleon_mast_p",
        name: "Galleon Retro"
    },
    {
        code: "labs_holyfield_p",
        name: "Loophole"
    },
    {
        code: "labs_pillarheat_p",
        name: "Barricade"
    },
    {
        code: "labs_pillarwings_p",
        name: "Colossus"
    },
    {
        code: "labs_pillarglass_p",
        name: "Hourglass"
    },
    {
        code: "ko_calavera_p",
        name: "Calavera"
    },
    {
        code: "ko_carbon_p",
        name: "Carbon"
    },
    {
        code: "ko_quadron_p",
        name: "Quadron"
    },
    {
        code: "wasteland_night_p",
        name: "Badlands (Night)"
    },
    {
        code: "park_night_p",
        name: "Beckwith Park (Midnight)"
    },
    {
        code: "park_rainy_p",
        name: "Beckwith Park (Stormy)"
    },
    {
        code: "park_bman_p",
        name: "Beckwith Park (Gotham Night)"
    },
    {
        code: "park_snowy_p",
        name: "Beckwith Park (Snowy)"
    },
    {
        code: "cs_day_p",
        name: "Champions Field (Day)"
    },
    {
        code: "bb_p",
        name: "Champions Field (NFL)"
    },
    {
        code: "outlaw_oasis_p",
        name: "Deadeye Canyon (Oasis)"
    },
    {
        code: "stadium_day_p",
        name: "DFH Stadium (Day)"
    },
    {
        code: "stadium_winter_p",
        name: "DFH Stadium (Snowy)"
    },
    {
        code: "stadium_foggy_p",
        name: "DFH Stadium (Stormy)"
    },
    {
        code: "stadium_race_day_p",
        name: "DFH Stadium (Circuit)"
    },
    {
        code: "chn_stadium_day_p",
        name: "Forbidden Temple (Day)"
    },
    {
        code: "fni_stadium_p",
        name: "Forbidden Temple (Fire & Ice)"
    },
    {
        code: "farm_night_p",
        name: "Farmstead (Night)"
    },
    {
        code: "farm_upsidedown_p",
        name: "Farmstead (The Upside Down)"
    },
    {
        code: "eurostadium_night_p",
        name: "Mannfield (Night)"
    },
    {
        code: "eurostadium_snownight_p",
        name: "Mannfield (Snowy)"
    },
    {
        code: "eurostadium_rainy_p",
        name: "Mannfield (Stormy)"
    },
    {
        code: "neotokyo_toon_p",
        name: "Neo Tokyo (Comic)"
    },
    {
        code: "beach_night_p",
        name: "Salty Shores (Night)"
    },
    {
        code: "arc_darc_p",
        name: "Starbase ARC (Aftermath)"
    },
    {
        code: "throwbackhockey_p",
        name: "Throwback Stadium (Snowy)"
    },
    {
        code: "trainstation_dawn_p",
        name: "Urban Central (Dawn)"
    },
    {
        code: "trainstation_night_p",
        name: "Urban Central (Night)"
    },
    {
        code: "trainstation_spooky_p",
        name: "Urban Central (Haunted)"
    },
    {
        code: "utopiastadium_dusk_p",
        name: "Utopia Coliseum (Dusk)"
    },
    {
        code: "utopiastadium_lux_p",
        name: "Utopia Coliseum (Gilded)"
    },
    {
        code: "utopiastadium_snow_p",
        name: "Utopia Coliseum (Snowy)"
    },
    {
        code: "wasteland_night_s_p",
        name: "Wasteland (Night)"
    },
    {
        code: "swoosh_p",
        name: "Champions Field (Nike FC)"
    },
    {
        code: "farm_hw_p",
        name: "Farmstead (Spooky)"
    },
    {
        code: "farm_grs_p",
        name: "Farmstead (Pitched)"
    },
    {
        code: "eurostadium_dusk_p",
        name: "Mannfield (Dusk)"
    },
    {
        code: "neotokyo_hax_p",
        name: "Neo Tokyo (Hacked)"
    },
    {
        code: "wasteland_grs_p",
        name: "Wasteland (Pitched)"
    },
    {
        code: "labs_cosmic_p",
        name: "Cosmic (Old)"
    },
    {
        code: "labs_doublegoal_p",
        name: "Double Goal (Old)"
    },
    {
        code: "labs_octagon_p",
        name: "Octagon (Old)"
    },
    {
        code: "labs_underpass_v0_p",
        name: "Underpass (Old)"
    },
    {
        code: "haunted_trainstation_p",
        name: "Urban Central (Haunted)"
    }
]);

console.log("Arenas seeded successfully.")
