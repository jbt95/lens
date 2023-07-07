import { Container } from 'inversify';

const container = new Container({
	autoBindInjectable: true,
	defaultScope: 'Singleton',
	skipBaseClassChecks: true
});

export default container;
