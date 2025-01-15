import json
from datetime import datetime, timedelta

json_path = "../server/data/puzzles-fr.json"

def get_next_date(date):
    next_date = datetime.strptime(date, '%Y-%m-%d') + timedelta(days=1)
    next_date = next_date.strftime('%Y-%m-%d')
    return next_date

def insert_puzzle(data, groups, new_date, last_date):
    # Si la date du nouveau puzzle est plus ancienne que la date du dernier puzzle, on décale les dates des puzzles suivants
    if last_date >= new_date:
        for i in range(len(data)):
            if data[i]['date'] >= new_date:
                data[i]['date'] = get_next_date(data[i]['date'])
    # On ajoute le nouveau puzzle
    data.append({
        'date': new_date,
        'groups': groups
    })
    print(f"Puzzle ajouté pour la date {new_date}")
    with open(json_path, 'w') as file:
        json.dump(data, file, indent=4)

def main():
    with open(json_path, 'r') as file:
        data = json.load(file)
    dates = [puzzle['date'] for puzzle in data]
    last_date = max(dates)
    next_date = get_next_date(last_date)
    
    new_puzzle = input('''Entre le puzzle sous le format: 
Nom catégorie 1: MOT1, MOT2, MOT3, MOT4; Nom catégorie 2: MOT5, MOT6, MOT7, MOT8; Nom catégorie 3: MOT9, MOT10, MOT11, MOT12; Nom catégorie 4: MOT13, MOT14, MOT15, MOT16

''')
    categories = new_puzzle.split(';')
    assert len(categories) == 4, "Il doit y avoir 4 catégories"
    groups = []
    for category in categories:
        category_name, words = category.split(':')
        category_name = category_name.strip()
        words = words.split(',')
        assert len(words) == 4, "Il doit y avoir 4 mots par catégorie"
        groups.append({
            'name': category_name,
            'words': words
        })
    
    date_option = input(f'Par défaut, ce puzzle sera ajouté à la date {next_date}. Appuyez sur Entrée pour conserver cette date, ou entrez une nouvelle date au format YYYY-MM-DD\n')
    if date_option == '':
        date = next_date
    else:
        date = date_option
    
    insert_puzzle(data, groups, date, last_date)

if __name__ == "__main__":
    main()