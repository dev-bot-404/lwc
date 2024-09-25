    import { LightningElement, track } from 'lwc';
    import retriveCategoryNews from "@salesforce/apex/NewsController.retriveCategoryNews";
    import { NavigationMixin } from "lightning/navigation";

    const filtersArray = ["News source", "Author", "Date"];

    export default class TetSeptember2023_NewsApi extends NavigationMixin(LightningElement) {
        @track result = []
        @track selectedNews={};
        @track showFilter = false;
        @track searchValue = '';
        category = '';
        @track authors = [];
        @track date = [];
        @track newsSource = [];

        get filtertabs(){
            const filters = [];
            filtersArray.map( tab => {
                filters.push({
                    value: tab,
                    label: tab
                });
            });

            console.log('filter Tabs: ',filters);
            return filters;
        }
        
        connectedCallback(){
            this.fetchNews();
        }

    /****fetchNews method gets called on page load, and within this, we are calling the retriveNews apex method using apex imperative approach****/
        fetchNews(categ){
            retriveCategoryNews({'category':categ}).then(response=>{
                console.log(JSON.stringify(response,null,2));
                this.formatNewsData(response.articles)
            }).catch(error=>{
                console.error(error);
            })
        }

    /****formatNewsData method structuring the response we are getting from the apex method by adding the id, name and date  ****/
        formatNewsData(res){
            this.result = res.map((item, index)=>{
                let id = `new_${index+1}`;
                let date = new Date(item.publishedAt).toDateString()
                let name = item.source.name;
                return { ...item, id: id, name: name, date: date}
            })
            console.log('Formatted',JSON.stringify(this.result,null,2));

            this.newsSource = this.result.map(news => ({
                label: news.name,
                value: news.name
            }));
            console.log('newsSource',JSON.stringify(this.newsSource));
            
            this.date = this.result.map(news => ({
                label: news.date,
                value: news.date
            }));
            console.log('date',JSON.stringify(this.date));

            this.authors = this.result.map(news => ({
                label: news.author,
                value: news.author
            })); 
            console.log('author',JSON.stringify(this.authors));

        }

        redirectToNewsPage(event){
            let id = event.target.dataset.item;
            console.log('id--',id);
            
            this.result.forEach(item=>{
                if(item.id === id){
                    this.selectedNews ={...item}
                }
            })
            console.log('selected--',JSON.stringify(this.selectedNews));

            
            var a = "url";
            var u = this.selectedNews[a]
            const config = {
                type: 'standard__webPage',
                attributes: {
                    url: u
                }
            };
            this[NavigationMixin.Navigate](config);
        }

        
        handleActive(event){
            var key = event.target.value;
            console.log('active--',event.target.value);

            if (key === 'Home') {
                this.category = 'general';
            } else if (key === 'Business') {
                this.category = 'business';
            } else if (key === 'Entertainment') {
                this.category = 'entertainment';
            } else if (key === 'General') {
                this.category = 'general';
            } else if (key === 'Health') {
                this.category = 'health';
            } else if (key === 'Science') {
                this.category = 'science';
            } else if (key === 'Sports') {
                this.category = 'sports';
            } else if (key === 'Technology'){
                this.category = 'technology';
            }


            console.log('category', this.category);
            this.fetchNews(this.category);
        }

        

        handleSearchValue(event){
            if(event.target.value == ''){
                this.fetchNews(this.category);
            }
            else{
                this.searchValue = event.target.value.toLowerCase();
            }
        }

        handleSearch(){
            this.result = this.result.filter(res => res.title.toLowerCase().includes(this.searchValue));
        }

        handleFilter(){
            this.showFilter = true;
        }

        applyFilters() {

            let temparray = [];
            this.result = [];
            this.items.forEach(filter => {
                console.log('1',JSON.parse(JSON.stringify(this.result)));
                temparray = this.result.filter(news => {
                    if (filter.filter === 'News source') {
                        return news.source.name === filter.label;
                    } else if (filter.filter === 'Author') {
                        return news.author === filter.label;
                    } else if (filter.filter === 'Date') {
                        return news.date === filter.label;
                    }
                    return true;
                });
                this.result.push(...temparray);
                console.log('2',JSON.parse(JSON.stringify(this.result)));
            });
        }

        handleRemovePill(event)
        {
            this.items=this.items.filter((item)=>item.label!=event.target.label);
            this.filtereditems=this.items.filter((item)=>item.label!=event.target.label);
            if(this.items.length===0)
                this.result = this.result;
            this.applyFilters();
        }


        @track items=[];
        @track filtereditems=[];

        handleSelectNews(event)
        {
            this.items.push({
                label : event.target.value,
                filter : 'News source'
            })
            this.applyFilters();
        }

        handleSelectAuthor(event)
        {
            this.items.push({
                label : event.target.value,
                filter : 'Author'
            })
            this.applyFilters();
        }

        handleSelectDate(event)
        {
            this.items.push({
                label : event.target.value,
                filter : 'Date'
            })
            this.applyFilters();
        }



    }