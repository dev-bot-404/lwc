import { LightningElement, track } from 'lwc';
import retriveCategoryNews from '@salesforce/apex/NewsController.retriveCategoryNews';
import { NavigationMixin } from 'lightning/navigation';

export default class TetSeptember2023_NewsApi extends NavigationMixin(LightningElement) {
    @track result = [];
    @track selectedNews = {};
    @track showFilter = false;
    searchValue = '';
    category = '';
    @track authors = [];
    @track dates = [];
    @track newsSource = [];

    @track selectedNewsSources = [];
    @track selectedAuthors = [];
    @track selectedDates = [];
    @track items = [];

    connectedCallback() {
        this.fetchNews();
    }

    fetchNews(categ = this.category) {
        retriveCategoryNews({ category: categ })
            .then(response => {
                this.formatNewsData(response.articles);
            })
            .catch(error => {
                console.error(error);
            });
    }

    formatNewsData(res) {
        this.result = res.map((item, index) => {
            let id = `new_${index + 1}`;
            let date = new Date(item.publishedAt).toDateString();
            let name = item.source.name;
            return { ...item, id: id, name: name, date: date };
        });

        this.newsSource = Array.from(new Set(this.result.map(news => news.name)))
            .map(name => ({ label: name, value: name }));

        this.dates = Array.from(new Set(this.result.map(news => news.date)))
            .map(date => ({ label: date, value: date }));

        this.authors = Array.from(new Set(this.result.map(news => news.author)))
            .map(author => ({ label: author, value: author }));
    }

    redirectToNewsPage(event) {
        let id = event.target.dataset.item;
        let selected = this.result.find(item => item.id === id);
        if (selected) {
            this.selectedNews = selected;
            const config = {
                type: 'standard__webPage',
                attributes: {
                    url: this.selectedNews.url
                }
            };
            this[NavigationMixin.Navigate](config);
        }
    }

    handleActive(event) {
        this.category = event.target.value.toLowerCase();
        this.fetchNews(this.category);
    }

    handleSearchValue(event) {
        this.searchValue = event.target.value.toLowerCase();
    }

    handleSearch() {
        if (this.searchValue) {
            this.result = this.result.filter(res => res.title.toLowerCase().includes(this.searchValue));
        } else {
            this.fetchNews(this.category);
        }
    }

    toggleFilter() {
        this.showFilter = !this.showFilter; 
        if (!this.showFilter) {
            this.clearSelections(); 
        }
    }

    applyFilters() {
        let filteredResults = this.result;

        if (this.selectedNewsSources.length > 0) {
            filteredResults = filteredResults.filter(news => this.selectedNewsSources.includes(news.name));
        }

        if (this.selectedAuthors.length > 0) {
            filteredResults = filteredResults.filter(news => this.selectedAuthors.includes(news.author));
        }

        if (this.selectedDates.length > 0) {
            filteredResults = filteredResults.filter(news => this.selectedDates.includes(news.date));
        }

        this.result = filteredResults;

        this.updateFilterItems('News source', this.selectedNewsSources);
        this.updateFilterItems('Author', this.selectedAuthors);
        this.updateFilterItems('Date', this.selectedDates);

        this.showFilter = false; 
    }

    handleRemovePill(event) {
        const filterToRemove = event.target.dataset.label;

        this.items = this.items.filter(item => item.label !== filterToRemove);

        this.selectedNewsSources = this.selectedNewsSources.filter(source => source !== filterToRemove);
        this.selectedAuthors = this.selectedAuthors.filter(author => author !== filterToRemove);
        this.selectedDates = this.selectedDates.filter(date => date !== filterToRemove);

        this.applyFilters();
    }

    handleSelectNews(event) {
        this.selectedNewsSources = Array.from(event.detail.value);
    }

    handleSelectAuthor(event) {
        this.selectedAuthors = Array.from(event.detail.value);
    }

    handleSelectDate(event) {
        this.selectedDates = Array.from(event.detail.value);
    }

    updateFilterItems(filterType, selectedValues) {
        this.items = this.items.filter(item => item.filter !== filterType);
        selectedValues.forEach(value => {
            this.items.push({ label: value, filter: filterType });
        });
    }

    clearSelections() {
        this.selectedNewsSources = [];
        this.selectedAuthors = [];
        this.selectedDates = [];
    }
}
