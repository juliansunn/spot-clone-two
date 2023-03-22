import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

import { useState } from 'react';
import { useRecoilState } from 'recoil';
import Datepicker from 'tailwind-datepicker-react';
import { endDateState, startDateState } from '../atoms/searchAtom';

const defaultOptions = {
	todayBtn: false,
	theme: {
		cursor: 'pointer',
		background: 'bg-zinc-300 dark:bg-zinc-500',
		todayBtn: 'bg-green-500',
		clearBtn: '',
		icons: '',
		text: 'text-zinc-800 dark:text-zinc-100',
		disabledText: 'text-zinc-400 dark:text-zinc-600',
		input: 'bg-zinc-300 dark:bg-zinc-600',
		inputIcon: '',
		selected: 'bg-green-500'
	},
	icons: {
		prev: () => <ChevronLeftIcon className="h-5 w-5" />,
		next: () => <ChevronRightIcon className="h-5 w-5" />
	},
	language: 'en'
};

export default function MyDatePicker() {
	const [startShow, setStartShow] = useState(false);
	const [endShow, setEndShow] = useState(false);
	const [endDate, setEndDate] = useRecoilState(endDateState);
	const [startDate, setStartDate] = useRecoilState(startDateState);

	const handleStartDateChange = (selectedDate) => {
		setStartDate(endDate <= selectedDate ? endDate : selectedDate);
	};
	const handleEndDateChange = (selectedDate) => {
		setEndDate(startDate >= selectedDate ? startDate : selectedDate);
	};

	const handleStartClose = (state) => {
		setStartShow(state);
	};
	const handleEndClose = (state) => {
		setEndShow(state);
	};
	const startOptions = {
		title: 'Start Date',
		maxDate: endDate,
		defaultDate: startDate,
		...defaultOptions
	};
	const endOptions = {
		title: 'End Date',
		minDate: startDate,
		defaultDate: endDate,
		maxDate: new Date().setDate(new Date().getDate()),
		...defaultOptions
	};
	return (
		<div className="flex flex-col sm:flex-row mt-4">
			<div>
				<Datepicker
					options={startOptions}
					onChange={handleStartDateChange}
					show={startShow}
					setShow={handleStartClose}
				/>
			</div>
			<div>
				<Datepicker
					options={endOptions}
					onChange={handleEndDateChange}
					show={endShow}
					setShow={handleEndClose}
				/>
			</div>
		</div>
	);
}
