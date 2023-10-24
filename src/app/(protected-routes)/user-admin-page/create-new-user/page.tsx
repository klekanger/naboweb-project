'use client';

import BackButton from '@/components/BackButton';
import { Input } from '@nextui-org/input';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react';

import { useEffect, useState } from 'react';

type NewUser = {
  email: string;
  firstName: string;
  lastName: string;
};

async function createUser(user: NewUser) {
  if (validateForm(user) === true) {
    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userToCreate: user,
          userRole: 'user',
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data;
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  }
}

function validateForm(user: NewUser) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    emailPattern.test(user?.email) &&
    user?.firstName !== '' &&
    user?.lastName !== ''
  );
}

export default function Page() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {}, [newUser]);

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-8 text-center">Opprett ny bruker</h1>

        <Card
          classNames={{
            base: 'mypage-card',
          }}
        >
          <CardHeader className="justify-between ">
            <div className="mx-2 flex flex-col items-start justify-center gap-1">
              <div className="mt-5 text-left">
                <p>Her kan du opprette en ny bruker. </p>
                <p>
                  Etter at brukeren er opprettet, vil vedkommende få en e-post
                  med instruksjoner for innlogging.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="mb-5 flex gap-5">
              <Input
                type="email"
                label="E-post"
                description="E-posten som vil bli brukt til innlogging"
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <Input
                type="text"
                label="Fornavn"
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
              />
            </div>
            <div className="flex gap-5 ">
              <Input
                type="text"
                label="Etternavn"
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    lastName: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3"></div>
          </CardBody>

          <div>
            <Button
              color="default"
              className="mb-8 ml-5"
              name="submit-form"
              onPress={() => {
                if (validateForm(newUser)) {
                  onOpen();
                } else {
                  console.error('not valid');
                }
              }}
            >
              Opprett bruker
            </Button>
          </div>
          <Divider className="mb-8" />
          <div className="mb-8 px-5 text-left">
            <BackButton buttonLink="/user-admin-page" />
          </div>
        </Card>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Er du sikker
              </ModalHeader>
              <ModalBody>
                <p>Er du sikker på at du vil opprette en ny bruker?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Avbryt
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    createUser(newUser);
                  }}
                >
                  Opprett
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
