import { createElement } from 'lwc';
import Tet_23August2024_CloudSales from 'c/tet_23August2024_CloudSales';

describe('c-tet-23-august2024-cloud-sales', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('TODO: test case generated by CLI command, please fill in test logic', () => {
        // Arrange
        const element = createElement('c-tet-23-august2024-cloud-sales', {
            is: Tet_23August2024_CloudSales
        });

        // Act
        document.body.appendChild(element);

        // Assert
        // const div = element.shadowRoot.querySelector('div');
        expect(1).toBe(1);
    });
});