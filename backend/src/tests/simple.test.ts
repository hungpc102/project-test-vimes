describe('Simple Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string equality', () => {
    expect('hello').toBe('hello');
  });

  it('should test array includes', () => {
    expect(['a', 'b', 'c']).toContain('b');
  });

  it('should test object properties', () => {
    const user = { id: 1, name: 'Test User' };
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('Test User');
  });
}); 