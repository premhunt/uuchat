import React, { Component } from 'react';
import '../static/css/shortcut.css';


let Shortcut = {
    data: [],
    newScObj: {},
    getData: function(){
        if(this.data.length > 0){
            let newSc = localStorage.getItem("newShortcut");
            if(newSc){
                this.newScObj = JSON.parse(newSc);
                switch(this.newScObj.action){
                    case "INSERT":
                        this.insertData();
                        break;
                    case "UPDATE":
                        this.updateData();
                        break;
                    case "DELETE":
                        this.deleteData();
                        break;
                    default:
                        break;
                }
                localStorage.setItem('newShortcut', "");
                localStorage.setItem("shortcutList", JSON.stringify(Shortcut.data));
            }
        }
        return this.data;
    },
    setData: function(data){
        this.data = data;
        localStorage.setItem("shortcutList", JSON.stringify(data));
    },
    insertData: function(){
        this.data.unshift(this.newScObj);
    },
    updateData: function(){
        for(let i = 0, l = this.data.length; i < l; i++){
            if(this.data[i].id === this.newScObj.id){
                this.data[i] = this.newScObj;
            }
        }
    },
    deleteData: function(){
        let index = 0;
        for(let i = 0, l = this.data.length; i < l; i++){
            if(this.data[i].id === this.newScObj.id){
                index = i;
            }
        }
        this.data.splice(index, 1);
    }
};


class ShortList extends Component{
    selectClick = (e) => {
        e.stopPropagation();
        this.props.shortCutSelecterClick(document.querySelector('.s-'+this.props.num+' .key-value').innerHTML);
    };
    mouseoverHandle = (e) => {

        let shortcutList = document.querySelectorAll('.shortListUl li'),
            tg = e.target;

        for(let i = 0, l = shortcutList.length; i < l; i++){
            shortcutList[i].className = 's-'+i;
        }

        if(tg.tagName.toLowerCase() === 'li'){
            tg.className += ' on';
            this.props.shortcutMouseover(tg.getAttribute('data-num'));
        }
    };
    render(){
        let {num, name, value} = this.props;
        return (
            <li className={'s-'+num+(num === 0 ? ' on' : '')} onClick={this.selectClick} data-num={num} onMouseOver={this.mouseoverHandle}>
                <span className="key-name">{';'+name}</span>
                <span className="key-value">{value.replace(/(^\s*)/g, '')}</span>
            </li>
        );
    }
}

class ShortEmpty extends Component{
    render(){
        return (
            <div className="short-empty">
                You have not setting Shortcuts, you can setting some on the settings tab.
            </div>
        );
    }
}

class ChatShortcut extends Component{

    constructor(){
        super();
        this.state = {
            fetchList: []
        };
    }

    componentDidMount(){
        this.getShortCutsList();
    }

    getShortCutsList = () => {
        let _self = this,
            shortcutData = Shortcut.getData();

        if(shortcutData.length > 0){
            this.setState({
                fetchList: shortcutData
            });
            return false;
        }

        fetch('/shortcuts/cs/'+this.props.csid+'/all')
            .then((d)=>d.json())
            .then((data)=>{
                if(data.code === 200){
                    Shortcut.setData(data.msg);
                    _self.setState({
                        fetchList: data.msg
                    });
                }
            })
            .catch((e)=>{});
    };

    render(){
        let {fetchList} = this.state,
            {matchText, shortCutSelecterClick, shortcutMouseover} = this.props,
            shortListArr = [];

        for(let i = 0, l = fetchList.length; i < l; i++){
            let matchReg= new RegExp(matchText.slice(1), 'ig'),
                s = fetchList[i];

            if(matchReg.test(s.shortcut)){
                shortListArr.push(s);
            }
        }

        return (
            <div className="shortcut">
                <div className="short-head">
                    <span className="navigate-shortcuts">Navigate ↑ and ↓</span>
                    <span className="hotkey-shortcuts">
                        &nbsp; &nbsp;<strong>Enter</strong> or <strong>Tab</strong> to select
                    </span>
                </div>
                <div className="short-list">
                    <ul className="shortListUl">
                        {shortListArr.map((s, i)=>
                            <ShortList key={i} num={i} name={s.shortcut} value={s.msg} shortCutSelecterClick={shortCutSelecterClick} shortcutMouseover={shortcutMouseover} />
                        )}
                    </ul>
                </div>
                {(shortListArr.length === 0) && <ShortEmpty />}
            </div>
        );

    }

}


export default ChatShortcut;