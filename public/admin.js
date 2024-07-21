const socket = io('https://sarlextracoiffure.onrender.com', {
    transports: ['websocket'],
    reconnection: true
});

document.addEventListener('DOMContentLoaded', () => {
    const reservationList = document.getElementById('reservationList');
    const modal = document.getElementById('confirmationModal');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    const notificationSound = document.getElementById('notificationSound');
    let currentReservationId;

    socket.on('initialReservations', (reservations) => {
        reservations.forEach(reservation => {
            const li = document.createElement('li');
            li.dataset.id = reservation.id;
            li.innerHTML = `
                <strong>${reservation.name}</strong> |
                Téléphone - ${reservation.phone} |
                Coiffure - ${reservation.haircut} |
                Type - ${reservation.type} |
                Heure - ${reservation.time}
                <button class="delete-btn" data-id="${reservation.id}">Supprimer</button>
            `;
            reservationList.prepend(li);
        });
    });

    socket.on('newReservation', (reservation) => {
        const li = document.createElement('li');
        li.dataset.id = reservation.id;
        li.innerHTML = `
            <strong>${reservation.name}</strong> |
            Téléphone - ${reservation.phone} |
            Coiffure - ${reservation.haircut} |
            Type - ${reservation.type} |
            Heure - ${reservation.time}
            <button class="delete-btn" data-id="${reservation.id}">Supprimer</button>
        `;
        reservationList.prepend(li);

        notificationSound.play().catch(error => console.log('Erreur lors de la lecture du son:', error));

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Nouvelle réservation", {
                body: `${reservation.name} a réservé pour ${reservation.time}`
            });
        }
    });

    socket.on('reservationDeleted', (id) => {
        const li = document.querySelector(`[data-id="${id}"]`);
        if (li) li.remove();
    });

    socket.on('allReservationsDeleted', () => {
        reservationList.innerHTML = '';
    });

    reservationList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            currentReservationId = e.target.dataset.id;
            openModal();
        }
    });

    confirmDelete.addEventListener('click', () => {
        socket.emit('deleteReservation', currentReservationId);
        closeModal();
    });

    cancelDelete.addEventListener('click', closeModal);

    function openModal() {
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    if ("Notification" in window) {
        Notification.requestPermission();
    }
});
