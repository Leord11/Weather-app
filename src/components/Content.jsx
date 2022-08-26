import { useState } from "react";

const Content = () => {

    const controller = new AbortController();
    const signal = controller.signal;

    const [location, setLocation] = useState('');
    const [weather, setWeather] =useState('');
    const [content, setContent] = useState('');
    const [cloudy, setCloudy] = useState('0');
    const [humidity, setHumidity] = useState('0');
    const [wind, setWind] = useState('0');
    const [rain, setRain] = useState('0');
    const [celcius, setCelcius] = useState('');
    const [icon, setIcon] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error , setError] = useState('');
    const [background, setBackground] = useState('./img/default-bg.jpg');
    const synth = window.speechSynthesis;

    const speak = (utter) => {
    
    const utterThis = new SpeechSynthesisUtterance(utter);
 
    const defaultVoice = synth.getVoices();

    utterThis.voice = defaultVoice.default;
    utterThis.pitch = 1;
    utterThis.rate = 1;
    synth.speak(utterThis);
  
    utterThis.onpause = (event) => {
        const char = event.utterance.text.charAt(event.charIndex);
        console.log(
        `Speech paused at character ${event.charIndex} of "${event.utterance.text}", which is "${char}".`
        );
    }
    };

    const send = () => {
        
        setError('');
        setIsPending(true);
        setContent('');
        fetch('http://api.weatherapi.com/v1/current.json?key=85bc3210e7b5435fa0095936222407&q='+ location, signal).then(response => {
            console.log(response);
            if(!response.ok) {
                if(response.status === 400) {
                    throw Error('No Matching location found');
                }
                throw Error('Could not fetch data from resource');
              }
            return response.json();
        }).then(data => {
                let text = data?.current?.condition.text;
                let name = data?.location?.name;
                let content = `The weather in ${name} is ${text}.`;

                if(text.includes('rain') || text.includes('Rain')) {
                    setBackground('./img/rainy-bg.jpg');
                }
                if(text.includes('clear') || text.includes('Clear')) {
                    setBackground('./img/clear-bg.jpg');
                }
                if(text.includes('sunny') || text.includes('Sunny')) {
                    setBackground('./img/sunny.jpg');
                }
                if(text.includes('overcast') || text.includes('Overcast')) {
                    setBackground('./img/overcast-bg.jpg');
                }
                if(text.includes('cloudy') || text.includes('Cloudy')) {
                    setBackground('./img/partly-cloudy.jpg');
                }
                setIsPending(false);
                speak(content);
                setCloudy(data?.current?.cloud);
                setWeather(text);
                setHumidity(data?.current?.humidity);
                setWind(data?.current?.wind_kph);
                setRain(data?.current?.precip_mm);
                setCelcius(data?.current?.temp_c);
                setIcon(data?.current?.condition.icon);
                setContent(content);
        }).catch(err => {
            // console.log(err.message);
            setIsPending(false);
            setError(err.message);
        });
    };

    const cancelRequest = () => {
        controller.abort();
        setIsPending(false);
    };
  return (
    <>
    <div className="background-image">
        <img src={background} alt="background"/>
    </div>
    {isPending && 
    (   <div>
        <p>Loading ...</p>
        <button onClick={cancelRequest}>Cancel</button>
        </div>
    )}
    <div className="content">
        <form onSubmit={(e) => {
            e.preventDefault();
            if(location){
                send();
            }        
        }}>
        <input type="text" onChange={e => setLocation(e.target.value)} value={location} placeholder="Search a place"/>
        <button><img src="./img/search.png" alt="search" /></button>
        </form>

        {error && 
            <div className="error">
                <h1>{error}</h1>
            </div>
        }
        {content && 
        <div className="details">
            <h1>{celcius}°</h1>
            <h3>{location}</h3>
            <span>
                <img src={icon} alt="icon" />
                <p>{weather}</p>
            </span>
        </div>
        }
        <div className="weather-details">
            <p>Weather Details</p>
            <span>
                <h5>Cloudy</h5>
                <h6>{cloudy}%</h6>
            </span>
            <span>
                <h5>Humidity</h5>
                <h6>{humidity}%</h6>
            </span>
            <span>
                <h5>Wind</h5>
                <h6>{wind}km/h</h6>
            </span>
            <span>
                <h5>Rain</h5>
                <h6>{rain}mm</h6>
            </span>
        </div>      
    </div>
    </>
  )
}

export default Content;