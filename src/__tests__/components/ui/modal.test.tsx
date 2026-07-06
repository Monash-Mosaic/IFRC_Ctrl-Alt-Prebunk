describe('Modal re-export', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('exports react-modal as the default export', () => {
    const Modal = require('@/components/ui/modal').default;
    const reactModal = require('react-modal');

    expect(Modal).toBe(reactModal);
    expect(typeof Modal.setAppElement).toBe('function');
  });
});
