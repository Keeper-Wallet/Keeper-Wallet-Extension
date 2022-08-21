import { ClockUnit } from '../../../utils/clockUnit';

const clockUnit = new ClockUnit();
const { I } = inject();

When('DEBUG PAUSE', async () => {
  I.wait(clockUnit.MINUTES * 60);
  console.info('=======DEBUG PAUSE=======');
});
