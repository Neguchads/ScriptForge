#!/usr/bin/env python3
"""
Validate style combinations for compatibility and coherence.
Checks if selected genres, eras, influences, and characteristics form a valid combination.

Usage:
    python validate_style_compatibility.py --genres Rock,Jazz --eras 1970s,1980s
"""

import argparse
import json
from typing import Dict, List, Tuple

# Compatibility rules
ERA_GENRE_COMPATIBILITY = {
    "1920s": ["Jazz", "Blues", "Classical"],
    "1930s": ["Jazz", "Blues", "Classical", "Swing"],
    "1940s": ["Jazz", "Blues", "Classical", "Swing"],
    "1950s": ["Rock", "Jazz", "Blues", "Classical", "Country"],
    "1960s": ["Rock", "Pop", "Jazz", "Blues", "Folk", "Soul"],
    "1970s": ["Rock", "Funk", "Soul", "Disco", "Prog Rock", "Metal", "Jazz"],
    "1980s": ["Synthwave", "Electronic", "New Wave", "Pop", "Rock", "Metal", "Hip-Hop"],
    "1990s": ["Grunge", "Britpop", "Hip-Hop", "Electronic", "Indie", "Alternative"],
    "2000s": ["Electronic", "Hip-Hop", "Indie", "Pop", "Alternative", "Metal"],
    "2010s": ["Electronic", "Hip-Hop", "Indie", "Pop", "EDM", "Alternative", "Experimental"],
    "2020s": ["Electronic", "Hip-Hop", "Indie", "Pop", "EDM", "Experimental", "Cyberpunk", "Synthwave"],
}

INFLUENCE_GENRE_COMPATIBILITY = {
    "Beatles": ["Rock", "Pop", "Indie", "Alternative"],
    "Miles Davis": ["Jazz", "Funk", "Soul", "Electronic"],
    "Kraftwerk": ["Electronic", "Synthwave", "Techno", "Cyberpunk"],
    "Daft Punk": ["Electronic", "House", "Techno", "EDM", "Synthwave"],
    "Radiohead": ["Indie", "Alternative", "Electronic", "Experimental"],
    "Kendrick Lamar": ["Hip-Hop", "Rap", "Soul", "Funk"],
    "Björk": ["Electronic", "Experimental", "Indie", "Alternative"],
    "Bach": ["Classical", "Symphonic Metal", "Prog Rock"],
}

MOOD_CHARACTERISTIC_COMPATIBILITY = {
    "Dark": ["Aggressive", "Intense", "Mysterious", "Melancholic"],
    "Uplifting": ["Energetic", "Euphoric", "Peaceful", "Sophisticated"],
    "Melancholic": ["Introspective", "Peaceful", "Mysterious", "Ethereal"],
    "Aggressive": ["Intense", "Dark", "Energetic", "Gritty"],
}

def check_era_genre_compatibility(eras: List[str], genres: List[str]) -> Tuple[bool, List[str]]:
    """Check if selected eras are compatible with genres."""
    issues = []
    
    for era in eras:
        if era not in ERA_GENRE_COMPATIBILITY:
            issues.append(f"Unknown era: {era}")
            continue
        
        compatible_genres = ERA_GENRE_COMPATIBILITY[era]
        incompatible = [g for g in genres if g not in compatible_genres]
        
        if incompatible:
            issues.append(f"Era {era} may not align well with: {', '.join(incompatible)}")
    
    return len(issues) == 0, issues

def check_influence_genre_compatibility(influences: List[str], genres: List[str]) -> Tuple[bool, List[str]]:
    """Check if selected influences are compatible with genres."""
    issues = []
    
    for influence in influences:
        if influence not in INFLUENCE_GENRE_COMPATIBILITY:
            continue  # Unknown influence, skip
        
        compatible_genres = INFLUENCE_GENRE_COMPATIBILITY[influence]
        incompatible = [g for g in genres if g not in compatible_genres]
        
        if incompatible:
            issues.append(f"Influence {influence} may not fit with: {', '.join(incompatible)}")
    
    return len(issues) == 0, issues

def check_mood_compatibility(moods: List[str]) -> Tuple[bool, List[str]]:
    """Check if selected moods are compatible with each other."""
    issues = []
    
    for mood in moods:
        if mood not in MOOD_CHARACTERISTIC_COMPATIBILITY:
            continue
        
        compatible_moods = MOOD_CHARACTERISTIC_COMPATIBILITY[mood]
        incompatible = [m for m in moods if m != mood and m not in compatible_moods]
        
        if incompatible:
            issues.append(f"Mood '{mood}' may conflict with: {', '.join(incompatible)}")
    
    return len(issues) == 0, issues

def validate_combination(genres: List[str], eras: List[str], influences: List[str], 
                        moods: List[str]) -> Dict:
    """Validate a complete style combination."""
    
    results = {
        "valid": True,
        "warnings": [],
        "errors": [],
        "suggestions": []
    }
    
    # Check era-genre compatibility
    era_valid, era_issues = check_era_genre_compatibility(eras, genres)
    if not era_valid:
        results["warnings"].extend(era_issues)
    
    # Check influence-genre compatibility
    influence_valid, influence_issues = check_influence_genre_compatibility(influences, genres)
    if not influence_valid:
        results["warnings"].extend(influence_issues)
    
    # Check mood compatibility
    mood_valid, mood_issues = check_mood_compatibility(moods)
    if not mood_valid:
        results["warnings"].extend(mood_issues)
    
    # Generate suggestions
    if not era_valid or not influence_valid:
        results["suggestions"].append("Consider adjusting genres or eras for better coherence")
    
    if len(genres) > 3:
        results["suggestions"].append("Combining more than 3 genres may dilute the style identity")
    
    if len(influences) > 2:
        results["suggestions"].append("Too many influences may create conflicting directions")
    
    results["valid"] = len(results["errors"]) == 0
    
    return results

def main():
    parser = argparse.ArgumentParser(description="Validate style combinations")
    parser.add_argument("--genres", type=str, default="", help="Comma-separated genres")
    parser.add_argument("--eras", type=str, default="", help="Comma-separated eras")
    parser.add_argument("--influences", type=str, default="", help="Comma-separated influences")
    parser.add_argument("--moods", type=str, default="", help="Comma-separated moods")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    genres = [g.strip() for g in args.genres.split(",") if g.strip()]
    eras = [e.strip() for e in args.eras.split(",") if e.strip()]
    influences = [i.strip() for i in args.influences.split(",") if i.strip()]
    moods = [m.strip() for m in args.moods.split(",") if m.strip()]
    
    results = validate_combination(genres, eras, influences, moods)
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("🎵 Style Combination Validation")
        print(f"Genres: {', '.join(genres) or 'None'}")
        print(f"Eras: {', '.join(eras) or 'None'}")
        print(f"Influences: {', '.join(influences) or 'None'}")
        print(f"Moods: {', '.join(moods) or 'None'}")
        print()
        
        if results["valid"]:
            print("✅ Combination is valid!")
        else:
            print("❌ Combination has issues:")
            for error in results["errors"]:
                print(f"   - {error}")
        
        if results["warnings"]:
            print("\n⚠️  Warnings:")
            for warning in results["warnings"]:
                print(f"   - {warning}")
        
        if results["suggestions"]:
            print("\n💡 Suggestions:")
            for suggestion in results["suggestions"]:
                print(f"   - {suggestion}")

if __name__ == "__main__":
    main()
