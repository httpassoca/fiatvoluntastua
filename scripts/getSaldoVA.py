import sys
import json
import requests
from bs4 import BeautifulSoup

# URL for the POST request
url = 'https://saldocartao.up-portugal.pt/Consulta'

def login(username, password):
    # Your login credentials and other form data
    data = {
        'username': username,
        'password': password,
        'token': 'ChequeGourmet1559',  # Static value
        'acceptPolicy': '1'  # Checkbox value
    }

    # Headers from the curl command
    headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-GB,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        # Additional headers can be added as needed
    }

    # Initialize a session
    session = requests.Session()

    # Add the cookie to the session
    session.cookies.set('JSESSIONID', '7E7CB20B47F2EA7A442DED3C7F996156', domain='saldocartao.up-portugal.pt')

    # Perform the POST request within the session
    response = session.post(url, data=data, headers=headers)

    # Check response
    if response.ok:
        # Parse the response
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the element with the specified selector
        div_input1 = soup.find('div', class_='input1')
        # Format the div_input1 text to remove newlines and extra spaces
        div_input1_text = ' '.join(div_input1.get_text(strip=True).split()) if div_input1 else "Element not found"

        # Find the table and extract the first five rows
        table = soup.find('table', id='table1')
        rows = table.find_all('tr')[1:6]  # Skip header row and get next five

        table_data = []
        for row in rows:
            cols = row.find_all('td')
            cols = [' '.join(ele.text.split()) for ele in cols]
            table_data.append(cols)

                # Prepare the result as a dictionary
        result = {
            'div_input1': div_input1_text,
            'table_data': table_data
        }

        # Return the JSON string
        return json.dumps(result)
    else:
        # Return error message as JSON
        return json.dumps({'error': f"Request failed: Status code {response.status_code}"})

if __name__ == "__main__":
    if len(sys.argv) == 3:  # Expecting 3 arguments: script name, username, password
        username = sys.argv[1]
        password = sys.argv[2]
        result = login(username, password)
        print(result)
    else:
        print("Invalid arguments")
