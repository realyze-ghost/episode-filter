var React = require('react/addons');
var request = require('superagent');

var Home = React.createClass({

   mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return {
      forecast: {
        summary: '',
        temperature: ''
      },
      location: 'sydney',
      selectedDay: '',
      error: null
    };
  },

  loadForecast: function (day) {
    // Clear any errors.
    this.setState({error: null});

    let url = `/weather/${this.state.location}`;
    if (day) {
      url = `${url}/${day}`;
    } 

    // Get forecast data from the server.
    request
      .get(url)
      .end((err, res) => {
        if (err) {
          this.setState({
            forecast: {summary: '', temperature: ''},
            error: res
          });
          return;
        }
        return this.setState({
          forecast: {
            summary: res.body.currently.summary,
            temperature: res.body.currently.temperature
          }
        });
      });
  },

  handleSelectionChanged: function(e) {
    const day = e.target.value;
    this.setState({selectedDay: day});
  },

  getForecastCurrent: function () {
    this.loadForecast(null);
  },

  getForecastToday: function () {
    this.loadForecast('today');
  },

  getForecastForDay: function () {
    this.loadForecast(this.state.selectedDay);
  },

  render: function() {
    let error = '';
    let forecast = ''

    if (this.state.error) {
      if (this.state.error.status === 422) {
        error = <div>
          <div className="error">Oops! I could not find the requested location!</div>
          <div>To be fair, this is probably your fault. But here's an image of
          Nicolas Cage that will surely lift your spirits! Just look at him, his calm face,
          his, uh, weirdly long hair... I'm sure you feel much better now!</div>
          <div>
            <img src="http://cdn.screenrant.com/wp-content/uploads/Nicolas-Cage-Con-Air-Hair.jpg"/>
          </div>
      </div>
      } else {
        error = <div className="error">Error: Could not load forecast</div>
      }
    } else {
      forecast = <div>
        <div className="summary">Summary: {this.state.forecast.summary}</div>
        <div className="temperature">Temperature: {this.state.forecast.temperature}</div>
      </div>
    }

    return (
      <div className="hero-unit">
        <div className="forecast">
          <h2>Forecast</h2>
          {error}
          {forecast}

        </div>

        <div className="location">
          Where: <input type="text" valueLink={this.linkState('location')} />
        </div>

        <div className="buttons">
          <input type="button" value="get current" onClick={this.getForecastCurrent}></input>
          <input type="button" value="get today" onClick={this.getForecastToday}></input>
          <select onChange={this.handleSelectionChanged}>
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
          </select>
          <input type="button" value="get selected day" onClick={this.getForecastForDay}></input>
        </div>
      </div>
    );
  }
});

module.exports = Home;

