

export const calDiffISODate = (s: Date, e: Date) => {
    let date1 = new Date(s.toLocaleDateString('en-Us', {timeZone: 'Asia/Manila'}));
    let date2 = new Date(e.toLocaleDateString('en-Us', {timeZone: 'Asia/Manila'}));
    const timeDifference: number = date2.getTime() - date1.getTime();
    const seconds = timeDifference / 1000;
    const minutes = timeDifference / (1000 * 60);
    const hours = timeDifference / (1000 * 60 * 60);
    const days = timeDifference / (1000 * 60 * 60 * 24);

    return { seconds, minutes, hours, days }
}
