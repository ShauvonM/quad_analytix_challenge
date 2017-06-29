/**
 * Welcome!
 * 
 * In the interest of time, I can only guarantee that this code runs on the latest Chrome and MS Edge
 * 
 * I have added a few comments, but hopefully the code is clean enough to speak for itself.
 * I also added a few "TODO" comments to specify things that could be improved.
 * 
 * Question 1 is handled in the Selectron9000 React class
 * 
 * Questions 2 and 3 are handled in the Application class near the bottom
 */

var SELECT_ITEMS = [
    {
        id: 0,
        name: "Alan Bradley"
    },
    {
        id: 1,
        name:"Kevin Flynn"
    },
    {
        id: 2,
        name:"Lora Baines"
    },
    {
        id: 3,
        name:"Walter Gibbs"
    },
    {
        id: 4,
        name:"Ed Dillinger"
    },
    {
        id: 5,
        name:"Roy Kleinberg"
    }
];

/**
 * This is a react component for the little dropdown control specified.
 * It kills me inside how ugly it is with barebones CSS.
 */
var Selectron9000 = React.createClass({
    propTypes: {
        items: React.PropTypes.array.isRequired
    },

    getInitialState: function() {
        return {
            isOpen: false,
            // I'd rather use icons for this, obv
            buttonText: "\\/",
            selectedItems: [],
            searchTerm: null
        }
    },

    // TODO: close the control by clicking outside of it
    toggleOpen: function() {
        let newOpenState = !this.state.isOpen;
        this.setState(
            {
                isOpen: newOpenState,
                buttonText: newOpenState ? "/\\" : "\\/"
            }
        );
    },

    selectItem: function(item) {
        // strip html tags from the name
        let div = document.createElement("div");
        div.innerHTML = item.name;
        item.name = div.textContent || div.innerText || html;

        let selectedItems = [],
            addit = true;

        // loop through the selected items to see if the item clicked was already selected
        this.state.selectedItems.map(function(selectedItem) {
            if (selectedItem.id !== item.id) {
                selectedItems.push(selectedItem)
            } else {
                addit = false;
            }
        });
        // add the clicked item if it wasn't already selected
        if (addit) {
            selectedItems.push(item);
        }

        this.setState({
            selectedItems: selectedItems,
            searchTerm: null
        });
    },

    selectAll: function() {
        this.setState({
            selectedItems: this.props.items
        })
    },

    clearSelection: function() {
        this.setState({
            selectedItems: [],
            searchTerm: null
        })
    },

    // I suppose ideally these conditional render functions would be sub components
    // That opens the whole can of worms of having to pass state up and down the chain, though
    _renderOpenList: function() {
        if (this.state.isOpen || this.state.searchTerm) {
            let items = [];

            let term = this.state.searchTerm ? this.state.searchTerm.toLowerCase() : '';
            let regex = new RegExp('(' + term + ')', 'gi');

            // loop through the items, and set up the items we want to render
            this.props.items.map((item) => {
                let thisItem = {
                    name: item.name,
                    id: item.id,
                    class: ''
                }

                // add a selected class if this item is in the array of selected items
                if (this.state.selectedItems.length) {
                    this.state.selectedItems.map(function(selectedItem) {
                        if (selectedItem.id === item.id) {
                            thisItem.class = 'selected';
                        }
                    });
                }

                // if doing a search, make the matched text bold, because why not?
                if (item.name.toLowerCase().indexOf(term) > -1) {
                    thisItem.name = item.name.replace(regex, '<strong>$1</strong>');
                    items.push(thisItem);
                } else if (!this.state.searchTerm) {
                    items.push(thisItem);
                }
            });

            return (
                <ul>
                {
                    items.map(function(item, index) {
                        // I'm sure there's a "right" way to unescape the HTML, but I like living dangerously
                        // that's a joke - I wouldn't willfully violate XSS or other security concerns in production
                        return (
                            <li
                                className={item.class}
                                onClick={function() {this.selectItem(item)}.bind(this)}
                                key={item.id}
                                dangerouslySetInnerHTML={{__html: item.name}}></li>
                        );
                    }.bind(this))
                }
                {this._renderSelectAll()}
                </ul>
            );
        } else {
            return null;
        }
    },

    // only show the select all button if not doing a search
    // TODO: show the select all button for searches, and make it select all of the search results
    _renderSelectAll: function() {
        if (!this.state.searchTerm) {
            return (
                <li><button onClick={this.selectAll}>Select all</button></li>
            );
        } else {
            return null;
        }
    },

    // only show the clear button when there's something to clear
    _renderClear: function() {
        if (this.state.selectedItems.length) {
            return (
                <button class="button" onClick={this.clearSelection}>Clear</button>
            )
        } else {
            return null;
        }
    },

    // clear the input text when you click in there
    clickInput: function() {
        if (this.state.searchTerm === null) {
            this.setState({searchTerm: ""});
        }
    },

    // un-clear the input text when you blur the input (this reverts to the default text)
    blurInput: function() {
        if (!this.state.searchTerm) {
            this.setState({ searchTerm: null });
        }
    },

    onSearchChange: function(e) {
        this.setState({searchTerm: e.target.value});
    },

    // TODO: ideally the list of selected things would be clickable to remove them that way
    render: function() {
        let textValue;
        if (this.state.selectedItems.length) {
            textValue = '';
            this.state.selectedItems.map(function(item, index) {
                if (index > 0) {
                    textValue += ', ';
                }
                textValue += item.name;
            })
        } else {
            textValue = 'Select some stuff pls...';
        }

        // Yes, this could be done with a placeholder attribute, but this is the way I did it apparently
        let search = this.state.searchTerm !== null ? this.state.searchTerm : 'Searchems (TM)';

        return (
            <div className="selectron-9000">
                <span onClick={this.toggleOpen}>{textValue}</span>
                <button class="button" onClick={this.toggleOpen}>{this.state.buttonText}</button>
                {this._renderClear()}

                <input type="text" value={search} onClick={this.clickInput} onBlur={this.blurInput} onChange={this.onSearchChange} />
                
                {this._renderOpenList()}
            </div>
        );
    }
})

/**
 * This react component renders out the array in a semi-readable way
 */
function DumpArray(props) {
    // I refuse to use HTML tables unless absolutely necessary, fyi
    return (
        <div className="arraydump">
            <div className="row">
                <span><strong>Name</strong></span>
                <span><strong>Area</strong></span>
                <span><strong>Population</strong></span>
                <span><strong>Pop / Sq. KM</strong></span>
            </div>
        {
            props.arr.map(function(item, index) {
                let area = parseInt(item.area.replace('sq mi', '').replace(',', '')),
                    // the challenge specifically asks for Population / KM^2
                    kilometers = area *= 2.58998811,
                    density = Math.round((item.population / kilometers) * 100) / 100;

                // the lower-case strings were bothering me
                let name = item.name.substr(0, 1).toUpperCase() + item.name.substr(1);

                return (
                    <div className="row" key={item.name}>
                        <span>{name}</span>
                        <span>{item.area}</span>
                        <span>{Number(item.population).toLocaleString()}</span>
                        <span>{density}</span>
                    </div>
                );
            }.bind(this))
        }
        </div>
    );
}

DumpArray.propTypes = {
    // yarr, I be the pirate of the proptypes
    arr: React.PropTypes.array.isRequired
}

var Application = React.createClass({
    propTypes: {
        items: React.PropTypes.array.isRequired
    },

    render: function() {

        /**
         * Here is the Question 2 stuff
         * 
         * I re-ordered the array from what was in the prompt just to show that my 
         * name sorting actually works ;)
         */
        let theFollowingArray = [
            { name: "Alaska", area: "663,268 sq mi", population: 735132 },
            { name: "California", area: "163,696 sq mi", population: 38332521 },
            { name: "washington", area: "71,300 sq mi", population: 6971406 },
            { name: "oregon", area: "98,381 sq mi", population: 3899353 }
        ];

        // total hack, because I just want to get to the FUN PART
        let arraySortedByArea = JSON.parse(JSON.stringify(theFollowingArray)),
            arraySortedByName = JSON.parse(JSON.stringify(theFollowingArray)),
            arrayRoundedPopulations = JSON.parse(JSON.stringify(theFollowingArray));

        arraySortedByArea.sort((a, b) => {
            // quick and dirty :/
            let aarea = parseInt(a.area.replace('sq mi', '').replace(',', '')),
                barea = parseInt(b.area.replace('sq mi', '').replace(',', ''));

            return aarea > barea;
        });

        arraySortedByName.sort((a, b) => {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        });

        arrayRoundedPopulations.map((item) => {
            let population = item.population,
                digits = (population + '').length,
                power = 1000,
                decimal = population /= power,
                rounded = Math.round(population);
            
            item.population = (rounded * power);
        });

        /**
         * Question 3 proof of concept (the actual function is below)
         * 
         * Check the browser console to see the output here.
         */
        let objectTest1 = null;
        console.log("What if obj1 is null?", getObject(objectTest1));

        let objectTest2 = {
            foo: "bar"
        };
        console.log("What if obj1 doesn't have an obj2 property?", getObject(objectTest2));

        let objectTest3 = {
            obj2: "hello"
        };
        console.log("What if obj1.obj2 exists, but obj2 doesn't contain obj3?", getObject(objectTest3));

        let objectTest4 = {
            obj2: {
                obj3: "it works!"
            }
        };
        console.log("What if obj1.obj2.obj3 actually exists?", getObject(objectTest4));

        return (
            <div>
                <h5>The greatest dropdown selector ever made.</h5>
                <Selectron9000 items={this.props.items} />

                <br /><br />

                <h5>Array sorted by area (ascending)!</h5>
                <DumpArray arr={arraySortedByArea} />

                <br /><br />

                <h5>Array sorted by name (ascending)!</h5>
                <DumpArray arr={arraySortedByName} />

                <br /><br />

                <h5>Populations rounded to three significant digits!</h5>
                <DumpArray arr={arrayRoundedPopulations} />
            </div>
        )
    }

});

/**
 * Question 3
 * 
 * It's possible I don't quite understand this one. I'll admit my background is not computer science,
 * so high-level programming issues are not my strength.
 */
function getObject(obj1) {
    /**
     * This would be the solution I would use based on how I understand the question.
     * This leverages Javascript's laissez-faire attitude toward "truthiness"
     * and object types.
     * 
     * It will return null if obj2 does not contain the obj3 property 
     * (or if obj2 is a string, number, or function)
     */
    return obj1 && obj1.obj2 && obj1.obj2.obj3 ? obj1.obj2.obj3 : null;
}


ReactDOM.render(<Application items={SELECT_ITEMS} />, document.getElementById('container'));